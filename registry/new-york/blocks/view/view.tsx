"use client";

import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { type ReactElement, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form";
import { Spinner } from "@/registry/new-york/ui/spinner";

interface ViewFormData {
  name: string;
}

export enum ViewItemEditType {
  RENAME = "rename",
  DELETE = "delete",
}

export interface ViewItem {
  key: string;
  label: string;
  canDelete?: boolean;
  canEdit?: boolean;
}

export interface ViewProps {
  items: ViewItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  canAdd?: boolean;
  loading?: boolean;
  onAdd?: (label: string, payload?: any) => void;
  onEdit?: (
    key: string,
    type: ViewItemEditType,
    payload?: { label: string }
  ) => void;
  onActiveChange?: (key: string) => void;
  t?: Function;
}

export function View({
  items,
  activeKey,
  defaultActiveKey,
  loading = false,
  canAdd = false,
  onAdd,
  onEdit,
  onActiveChange,
  t,
}: ViewProps): ReactElement {
  const translate = useMemo(() => {
    return typeof t === "function" ? t : () => undefined;
  }, [t]);

  const [internalActiveKey, setInternalActiveKey] = useState<
    string | undefined
  >(defaultActiveKey ?? items[0]?.key);

  const [createViewDialogOpen, setCreateViewDialogOpen] = useState(false);
  const [renameViewDialogOpen, setRenameViewDialogOpen] = useState(false);
  const [deleteViewDialogOpen, setDeleteViewDialogOpen] = useState(false);

  // 根据是否传入 activeKey 来决定激活的视图
  const effectiveActiveKey = useMemo(() => {
    return typeof activeKey !== "undefined" ? activeKey : internalActiveKey;
  }, [activeKey, internalActiveKey]);

  const selectedView = useMemo(() => {
    return items.find((item) => item.key === effectiveActiveKey);
  }, [effectiveActiveKey, items]);

  const createViewForm = useForm<ViewFormData>({
    values: {
      name: "",
    },
  });

  const renameViewForm = useForm<ViewFormData>({
    values: {
      name: selectedView?.label ?? "",
    },
  });

  const handleCreateView = useCallback(
    async ({ name }: ViewFormData) => {
      await onAdd?.(name);
      setCreateViewDialogOpen(false);
      createViewForm.reset();
    },
    [createViewForm, onAdd]
  );

  const handleRenameView = useCallback(
    async ({ name }: ViewFormData) => {
      if (selectedView) {
        await onEdit?.(selectedView.key, ViewItemEditType.RENAME, {
          label: name,
        });
        setRenameViewDialogOpen(false);
        renameViewForm.reset();
      }
    },
    [selectedView, onEdit, renameViewForm]
  );

  const handleDeleteView = useCallback(async () => {
    if (selectedView) {
      await onEdit?.(selectedView.key, ViewItemEditType.DELETE);
      setDeleteViewDialogOpen(false);
    }
  }, [onEdit, selectedView]);

  // 生成可操作的按钮
  const generateActionableButton = useCallback(
    (
      activator: ReactElement,
      { key, canDelete = true }: ViewItem
    ): ReactElement => {
      return (
        <DropdownMenu key={key}>
          <DropdownMenuTrigger asChild>{activator}</DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setRenameViewDialogOpen(true);
              }}
            >
              {translate("turboost_ui.view.rename_view") ?? "Rename"}
            </DropdownMenuItem>

            {canDelete && (
              <DropdownMenuItem
                onClick={() => {
                  setDeleteViewDialogOpen(true);
                }}
              >
                {translate("turboost_ui.view.delete_view") ?? "Delete"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [setDeleteViewDialogOpen, setRenameViewDialogOpen, translate]
  );

  return (
    <div className="flex items-center gap-1">
      {items.map((item, index) => {
        const { key, label, canEdit = true } = item;

        const button = (
          <Button
            key={`${key}-${index}`}
            size="sm"
            variant={effectiveActiveKey === key ? "secondary" : "ghost"}
            onClick={() => {
              if (effectiveActiveKey !== key) {
                if (typeof activeKey === "undefined") {
                  setInternalActiveKey(key);
                }

                onActiveChange?.(key);
              }
            }}
          >
            <div className="flex items-center gap-1">
              {label}

              {effectiveActiveKey === key && canEdit && (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              )}
            </div>
          </Button>
        );

        return effectiveActiveKey === key && canEdit
          ? generateActionableButton(button, item)
          : button;
      })}

      {/* 创建视图 */}
      {canAdd && (
        <Dialog
          open={createViewDialogOpen}
          onOpenChange={setCreateViewDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <PlusIcon />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {translate("turboost_ui.view.create_view_dialog.title") ??
                  "Create View"}
              </DialogTitle>
            </DialogHeader>

            <Form {...createViewForm}>
              <form
                className="space-y-4"
                onSubmit={createViewForm.handleSubmit(handleCreateView)}
              >
                <FormField
                  name="name"
                  rules={{
                    required:
                      translate(
                        "turboost_ui.view.create_view_dialog.form.name_field.rule.required"
                      ) ?? "Name is required",
                  }}
                  control={createViewForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {translate(
                          "turboost_ui.view.create_view_dialog.form.name_field.label"
                        ) ?? "Name"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            translate(
                              "turboost_ui.view.create_view_dialog.form.name_field.placeholder"
                            ) ?? "Please enter view name"
                          }
                          maxLength={40}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Spinner />
                    ) : (
                      translate(
                        "turboost_ui.view.create_view_dialog.form.submit_btn.content"
                      ) ?? "Save"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* 编辑视图 */}
      <Dialog
        open={renameViewDialogOpen}
        onOpenChange={setRenameViewDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {translate("turboost_ui.view.rename_view_dialog.title") ??
                "Rename View"}
            </DialogTitle>
          </DialogHeader>

          <Form {...renameViewForm}>
            <form
              className="space-y-4"
              onSubmit={renameViewForm.handleSubmit(handleRenameView)}
            >
              <FormField
                name="name"
                rules={{
                  required:
                    translate(
                      "turboost_ui.view.rename_view_dialog.form.name_field.rule.required"
                    ) ?? "Name is required",
                }}
                control={renameViewForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {translate(
                        "turboost_ui.view.rename_view_dialog.form.name_field.label"
                      ) ?? "Name"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={40} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner />
                  ) : (
                    translate(
                      "turboost_ui.view.rename_view_dialog.form.submit_btn.content"
                    ) ?? "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 删除视图 */}
      <Dialog
        open={deleteViewDialogOpen}
        onOpenChange={setDeleteViewDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {translate("turboost_ui.view.delete_view_dialog.title") ??
                "Delete View"}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {translate("turboost_ui.view.delete_view_dialog.description", {
              viewName: selectedView?.label,
            }) ??
              `Are you sure you want to delete the view "${selectedView?.label}"?`}
          </DialogDescription>

          <DialogFooter>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleDeleteView}
            >
              {loading ? (
                <Spinner />
              ) : (
                translate(
                  "turboost_ui.view.delete_view_dialog.delete_btn.content"
                ) ?? "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
