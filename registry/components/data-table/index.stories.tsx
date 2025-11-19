import type { Meta, StoryObj } from "@storybook/nextjs";

import { DataTable } from "./index";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const meta = {
  title: "Components/Data Table",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bulkActions: (
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("enable");
          }}
        >
          Enable
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("disable");
          }}
        >
          Disable
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("delete");
          }}
        >
          Delete
        </Button>
      </ButtonGroup>
    ),
    onRowSelectionChange: (rows) => {
      console.log("row selection changed", rows);
    },
    onAllRowsSelectedChange: (selected) => {
      console.log("all rows selected", selected);
    },
    columns: [
      { id: "name", header: "Name", size: 100, pinned: "left" },
      { id: "age", header: "Age", size: 100 },
      { id: "gender", header: "Gender", size: 100 },
      { id: "address", header: "Address", size: 100 },
      { id: "createdAt", header: "Created At", size: 15000 },
    ],
    data: [
      {
        name: "John",
        age: 20,
        gender: "male",
        address: "123 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jane",
        age: 21,
        gender: "female",
        address: "456 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jim",
        age: 22,
        gender: "male",
        address: "789 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jill",
        age: 23,
        gender: "female",
        address: "101 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jack",
        age: 24,
        gender: "male",
        address: "123 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jill",
        age: 25,
        gender: "female",
        address: "456 Main St",
        createdAt: new Date(),
      },
      {
        name: "Jim",
        age: 26,
        gender: "male",
        address: "789 Main St",
        createdAt: new Date(),
      },
    ],
  },
};
