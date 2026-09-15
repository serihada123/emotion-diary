/* 서버리스 함수 인스턴스가 살아있는 동안만 유지되는 메모리 기반 카운터.
   인스턴스가 여러 개 뜨거나 재활용되면 카운트가 공유되지 않아 완벽하지 않지만,
   외부 저장소(Redis 등) 없이 짧은 시간 폭주성 요청을 막는 용도로는 충분하다. */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// 오래된 항목이 무한히 쌓이지 않도록, 호출될 때마다 가끔 만료된 항목을 정리한다.
let sweepCounter = 0;
function sweep(now: number) {
  sweepCounter += 1;
  if (sweepCounter % 200 !== 0) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function getClientIp(request: Request): string {
  // Netlify가 실제 클라이언트 IP를 이 헤더로 넣어줌.
  const nf = request.headers.get("x-nf-client-connection-ip");
  if (nf) return nf;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}
