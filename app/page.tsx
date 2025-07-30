"use client";

import { useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs";
import { components } from "./preview";
import { groupBy } from "lodash";

export default function Home() {
  const resources = useMemo(() => {
    return groupBy(components, "type");
  }, []);

  return (
    <Tabs
      defaultValue={components[0]?.name}
      className="w-full h-full p-4 flex gap-4 items-center"
    >
      <div className="w-fit space-y-2">
        <h1 className="text-lg font-semibold">组件分类</h1>

        <div>
          {Object.entries(resources).map(([key, value]) => (
            <div key={key} className="text-left">
              <span className="text-sm font-semibold">{key}</span>

              <div>
                <TabsList>
                  {value.map((component) => (
                    <TabsTrigger
                      className="text-sm"
                      key={component.name}
                      value={component.name}
                    >
                      {component.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-3/4 flex-1">
        {components.map((component) => (
          <TabsContent
            key={component.name}
            value={component.name}
            className="bg-white border rounded-lg p-4"
          >
            <h1 className="pb-2 font-semibold">组件名: {component.name}</h1>
            {component.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
