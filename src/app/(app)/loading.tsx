import { ProgressLoadingCard } from "@/components/ProgressLoadingCard";

export default function AppLoading() {
  return (
    <ProgressLoadingCard
      title="页面加载中"
      progress={60}
      label="正在整理学习数据..."
      hint="页面很快就好，请稍等。"
      showErrorSlot={false}
    />
  );
}
