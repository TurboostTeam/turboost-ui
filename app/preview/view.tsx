"use client";

import {
  View,
  ViewItem,
  ViewItemEditType,
} from "@/registry/new-york/blocks/view/view";
import { useCallback, useState } from "react";

export const ViewPreview = () => {
  const [views, setViews] = useState<ViewItem[]>([
    {
      key: "view1",
      label: "View 1",
    },
    {
      key: "view2",
      label: "View 2",
    },
  ]);

  const handleAddView = useCallback((label: string) => {
    setViews((prev) => [
      ...prev,
      {
        key: label,
        label,
      },
    ]);
  }, []);

  const handleEditView = useCallback(
    (key: string, type: ViewItemEditType, payload?: any) => {
      if (type === ViewItemEditType.RENAME) {
        console.log("handleEditView", key, type, payload);
        setViews((prev) =>
          prev.map((view) =>
            view.key === key ? { ...view, label: payload.label } : view
          )
        );
      } else if (type === ViewItemEditType.DELETE) {
        setViews((prev) => prev.filter((view) => view.key !== key));
      }
    },
    []
  );

  return (
    <View
      loading
      canAdd
      items={views}
      onActiveChange={(key) => {
        console.log("onActiveChange", key);
      }}
      onAdd={handleAddView}
      onEdit={handleEditView}
    />
  );
};
