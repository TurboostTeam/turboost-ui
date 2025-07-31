import { Table } from "@/registry/new-york/blocks/table/table";

export function TablePreview() {
  return (
    <Table
      columns={[
        { accessorKey: "name" },
        { accessorKey: "age" },
        { accessorKey: "gender" },
        { accessorKey: "address" },
        { accessorKey: "createdAt" },
      ]}
      rowSelection={{
        allowSelectAll: true,
        onSelectionChange: (rows) => {
          console.log("rows", rows);
        },
        bulkActions: (rows, isSelectedAll) => {
          return [
            {
              children: "Delete",
              onClick: () =>
                console.log("delete", {
                  rows,
                  isSelectedAll,
                }),
            },
          ];
        },
      }}
      data={[
        {
          name: "John",
          age: 20,
          address: "123 Main St",
          createdAt: new Date(),
          gender: "male",
        },
        {
          name: "Jane",
          age: 21,
          address: "456 Main St",
          createdAt: new Date(),
          gender: "female",
        },
        {
          name: "Jim",
          age: 22,
          address: "789 Main St",
          createdAt: new Date(),
          gender: "male",
        },
        {
          name: "Jill",
          age: 23,
          address: "101 Main St",
          createdAt: new Date(),
          gender: "female",
        },
        {
          name: "Jack",
          age: 24,
          address: "123 Main St",
          createdAt: new Date(),
          gender: "male",
        },
        {
          name: "Jill",
          age: 25,
          address: "456 Main St",
          createdAt: new Date(),
          gender: "female",
        },
        {
          name: "Jim",
          age: 26,
          address: "789 Main St",
          createdAt: new Date(),
          gender: "male",
        },
      ]}
    />
  );
}
