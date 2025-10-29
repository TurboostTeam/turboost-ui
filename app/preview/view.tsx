"use client";

import { useCallback, useState } from "react";

import {
  View,
  ViewItem,
  ViewItemEditType,
} from "@/registry/components/view/view";

export const ViewPreview = () => {
  const [views, setViews] = useState<ViewItem[]>([
    {
      key: "view0",
      label: "不可操作",
      canEdit: false,
    },
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
