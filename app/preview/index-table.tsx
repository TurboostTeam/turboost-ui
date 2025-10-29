import { IndexTable } from "@/registry/components/index-table/index-table";

export default function IndexTablePreview() {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
  ];

  const edges = [
    {
      node: {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        age: 25,
        createdAt: "2021-01-01",
      },
      cursor: "1",
    },
    {
      node: {
        id: "2",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        age: 26,
        createdAt: "2021-01-02",
      },
      cursor: "2",
    },
    {
      node: {
        id: "3",
        name: "Jim Doe",
        email: "jim.doe@example.com",
        age: 27,
        createdAt: "2021-01-03",
      },
      cursor: "3",
    },
  ];

  return (
    <IndexTable
      viewConfig={{
        items: [
          {
            label: "All",
            key: "all",
            canEdit: false,
          },
          {
            label: "View 1",
            key: "view1",
          },
        ],
        canAdd: true,
        onSave: (res) => {
          console.log("onSave", res);
        },
        onEdit: (res, type, payload) => {
          console.log("onEdit", res, type, payload);
        },
        onAdd: (res) => {
          console.log("onAdd", res);
        },
      }}
      search={{
        queryPlaceholder: "Search",
      }}
      columns={columns}
      edges={edges}
    />
  );
}
