import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "감정일기 (우루루)",
    short_name: "우루루",
    description: "우루루와 대화하며 오늘의 감정을 감정 오브젝트로 남기는 감정 일기",
    start_url: "/",
    display: "standalone",
    background_color: "#C5E4EF",
    theme_color: "#C5E4EF",
    icons: [
      {
        src: "/images/uruuru.png",
        sizes: "360x360",
        type: "image/png",
      },
    ],
  };
}
