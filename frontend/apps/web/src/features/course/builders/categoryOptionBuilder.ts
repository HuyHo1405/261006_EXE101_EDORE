import type { CategoryResponseDTO } from "@edore/types";

export interface CategoryOptionItem {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface SingleButtonOptionGroup {
  kind: "button";
  type: string;
  typeLabel: string;
  option: CategoryOptionItem;
}

export interface SelectorDropdownOptionGroup {
  kind: "selector";
  type: string;
  typeLabel: string;
  options: CategoryOptionItem[];
}

export type CategoryFilterGroup = SingleButtonOptionGroup | SelectorDropdownOptionGroup;

export class CategoryOptionBuilder {
  private categories: CategoryResponseDTO[] = [];
  private typeLabels: Record<string, string> = {
    SUBJECT: "Môn học",
    GRADE: "Khối lớp",
    PURPOSE: "Mục đích",
    OTHER: "Khác",
  };

  constructor(categories: CategoryResponseDTO[] = []) {
    this.categories = categories;
  }

  public setCategories(categories: CategoryResponseDTO[]): this {
    this.categories = categories || [];
    return this;
  }

  public setTypeLabel(type: string, label: string): this {
    this.typeLabels[type] = label;
    return this;
  }

  public build(): CategoryFilterGroup[] {
    if (!this.categories || this.categories.length === 0) return [];

    // Group categories by type
    const groupedMap = new Map<string, CategoryOptionItem[]>();

    for (const cat of this.categories) {
      if (!cat) continue;
      const typeKey = cat.type || "OTHER";
      if (!groupedMap.has(typeKey)) {
        groupedMap.set(typeKey, []);
      }
      groupedMap.get(typeKey)!.push({
        id: cat.id,
        name: cat.name || cat.code || "Danh mục",
        code: cat.code || "",
        type: typeKey,
      });
    }

    const resultGroups: CategoryFilterGroup[] = [];

    // Order of category types
    const typeOrder = ["SUBJECT", "GRADE", "PURPOSE", "OTHER"];
    const allTypes = Array.from(new Set([...typeOrder, ...groupedMap.keys()]));

    for (const typeKey of allTypes) {
      const options = groupedMap.get(typeKey);
      if (!options || options.length === 0) continue;

      const typeLabel = this.typeLabels[typeKey] || typeKey;

      if (options.length === 1) {
        // Group has only 1 item -> Build Single Button Option
        resultGroups.push({
          kind: "button",
          type: typeKey,
          typeLabel,
          option: options[0],
        });
      } else {
        // Group has > 1 items -> Build Selector Dropdown Group
        resultGroups.push({
          kind: "selector",
          type: typeKey,
          typeLabel,
          options,
        });
      }
    }

    return resultGroups;
  }
}
