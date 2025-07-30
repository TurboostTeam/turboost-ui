import { Loading } from "@/registry/new-york/blocks/loading/loading";

export const LoadingPreview = () => {
  return (
    <div className="flex space-x-2 items-center">
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </div>
  );
};
