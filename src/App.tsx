import {
  Add,
  Edit,
  EditOutlined,
  Remove,
  RemoveCircleOutline,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  getGridNumericOperators,
  getGridStringOperators,
  GridColDef,
  GridEditCellProps,
  GridFilterInputValueProps,
  GridFilterOperator,
  GridMoreVertIcon,
  GridRowsProp,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import Layout, { LootFormDialog } from "./Layout";
import { defaultLoot, Loot, LootTable } from "./data/initialLoot";

const LOCAL_STORAGE_PLAYER_DATA_KEY = "playerData";
const LOCAL_STORAGE_LOOT_DATA_KEY = "lootData";

type PlayerLoot = {
  quantity: number;
};

type Player = {
  id: string;
  name: string;
  loot: Partial<Record<string, PlayerLoot>>;
};

type PlayerData = [
  {
    id: "1";
    name: string;
    loot: Partial<Record<string, PlayerLoot>>;
  },
  {
    id: "2";
    name: string;
    loot: Partial<Record<string, PlayerLoot>>;
  },
  {
    id: "3";
    name: string;
    loot: Partial<Record<string, PlayerLoot>>;
  },
  {
    id: "4";
    name: string;
    loot: Partial<Record<string, PlayerLoot>>;
  }
];

const defaultPlayers: PlayerData = [
  {
    id: "1",
    name: "Player 1",
    loot: {
      Bone: { quantity: 10 },
      Scale: { quantity: 5 },
    },
  },
  {
    id: "2",
    name: "Player 2",
    loot: {
      Bone: { quantity: 5 },
      Scale: { quantity: 10 },
    },
  },
  {
    id: "3",
    name: "Player 3",
    loot: {
      Bone: { quantity: 30 },
      Scale: { quantity: 5 },
    },
  },
  {
    id: "4",
    name: "Player 4",
    loot: {
      Bone: { quantity: 5 },
      Scale: { quantity: 15 },
    },
  },
] as const;

const CustomEditNumberComponent: React.FC<GridEditCellProps<number>> = ({
  id,
  value: valueProp,
  field,
}) => {
  const apiRef = useGridApiContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const value = valueProp ?? 0;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Selects text for easy editing
    }
  }, []);

  const handleChange = (newValue: number) => {
    apiRef.current.setEditCellValue({
      id,
      field,
      value: newValue,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      handleChange(value + 1);
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      handleChange(Math.max(0, value - 1));
      event.preventDefault();
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <IconButton
        size="small"
        onClick={() => handleChange(Math.max(0, value - 1))}
      >
        <Remove fontSize="small" />
      </IconButton>
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value) || 0)}
        onKeyDown={handleKeyDown}
        variant="standard"
      />
      <IconButton size="small" onClick={() => handleChange(value + 1)}>
        <Add fontSize="small" />
      </IconButton>
    </div>
  );
};

const tagBgColor = (tag: string) => {
  const color = tag
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `hsl(${color % 360}, 70%, 70%)`;
};

const tagTextColor = (tag: string) =>
  parseInt(tagBgColor(tag).split(",")[2]) > 50 ? "black" : "white";

const syncDataToLocalStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadDataFromLocalStorage = (key: string): unknown => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : undefined;
};

const initialPlayerData = loadDataFromLocalStorage(
  LOCAL_STORAGE_PLAYER_DATA_KEY
);
const initialLoot = loadDataFromLocalStorage(LOCAL_STORAGE_LOOT_DATA_KEY);

const RowActionsMenu: React.FC<{
  removeLootType: () => void;
  editLootType: () => void;
}> = ({ removeLootType, editLootType }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <GridMoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            editLootType();
            handleClose();
          }}
        >
          <ListItemIcon>
            <EditOutlined />
          </ListItemIcon>
          <ListItemText>Edit Loot Type</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            removeLootType();
            handleClose();
          }}
        >
          <ListItemIcon>
            <RemoveCircleOutline />
          </ListItemIcon>
          <ListItemText>Remove Loot Type</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default function App() {
  const [playerData, setPlayerData] = useState<PlayerData>(
    (initialPlayerData as PlayerData) ?? defaultPlayers
  );
  const [lootData, setLootData] = useState<LootTable>(
    (initialLoot as LootTable) ?? defaultLoot
  );

  const [editLootDialogOpen, setEditLootDialogOpen] = useState(false);
  const [editLootId, setEditLootId] = useState<string | null>(null);

  const addLootType = (id: string, loot: Loot) => {
    setLootData((prev) => ({
      ...prev,
      [id]: loot,
    }));
  };
  const removeLootType = (id: string) => {
    setLootData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };
  const editLootType = (newId: string, loot: Loot, prevId: string) => {
    setLootData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [prevId]: _, ...rest } = prev;
      return {
        ...rest,
        [newId]: loot,
      };
    });
    setPlayerData(
      (prev) =>
        prev.map((player) => ({
          ...player,
          loot: {
            ...player.loot,
            [newId]: player.loot[prevId],
          },
        })) as PlayerData
    );
  };

  const tags = Array.from(
    new Set(
      Object.values(lootData).reduce<string[]>(
        (acc, { tags }) => [...acc, ...tags],
        []
      )
    )
  );

  const configurePlayers = (playerConfig: {
    "1": string;
    "2"?: string | undefined;
    "3"?: string | undefined;
    "4"?: string | undefined;
  }) => {
    const newPlayerData = Object.entries(playerConfig).map(([id, name]) => ({
      id,
      name,
      loot: playerData.find((player) => player.id === id)?.loot ?? {},
    })) as PlayerData;
    setPlayerData(newPlayerData);
  };

  const currentPlayers = Object.fromEntries(
    playerData.map(({ id, name }) => [id, name])
  ) as Record<"1" | "2" | "3" | "4", string>;

  const rows = (playerData: Player[]): GridRowsProp =>
    Object.entries(lootData).map(([id, { tags }]) => ({
      id,
      ...playerData
        .map((player) => ({
          [`${player.id}.quantity`]: player.loot[id]?.quantity ?? 0,
        }))
        .reduce((acc, player) => ({ ...acc, ...player }), {}),
      tags,
    }));

  const TagFilterValue = (props: GridFilterInputValueProps) => {
    const { item, applyValue } = props;

    return (
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <FormControl sx={{ width: "100%", height: "100%" }}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={tags}
            value={item.value || []}
            onChange={(_event, newValue) => {
              applyValue({ ...item, value: newValue });
            }}
            renderInput={(params) => (
              <TextField label="Tags" variant="standard" {...params} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((tag, index) => (
                <Chip
                  label={tag}
                  size="small"
                  style={{
                    backgroundColor: tagBgColor(tag),
                    color: tagTextColor(tag),
                  }}
                  {...getTagProps({ index })}
                  key={tag}
                />
              ))
            }
            renderOption={(props, option, { selected }) => (
              <MenuItem {...props} key={option}>
                <Checkbox checked={selected} />
                <Chip
                  label={option}
                  size="small"
                  style={{
                    backgroundColor: tagBgColor(option),
                    color: tagTextColor(option),
                  }}
                />
              </MenuItem>
            )}
          />
        </FormControl>
      </Box>
    );
  };

  const tagFilerOperators: GridFilterOperator[] = [
    {
      label: "Has at least one",
      value: "hasAtLeastOne",
      getApplyFilterFn: (filterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
          return null;
        }

        return (value: string[]) => {
          return (
            filterItem.value.length === 0 ||
            value.some((tag) => filterItem.value.includes(tag))
          );
        };
      },
      InputComponent: TagFilterValue,
    },
    {
      label: "Has all",
      value: "hasAll",
      getApplyFilterFn: (filterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
          return null;
        }

        return (value: string[]) => {
          return (
            filterItem.value.length === 0 ||
            filterItem.value.every((tag: string) => value.includes(tag))
          );
        };
      },
      InputComponent: TagFilterValue,
    },
    {
      label: "Does not have",
      value: "doesNotHave",
      getApplyFilterFn: (filterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
          return null;
        }

        return (value: string[]) => {
          return (
            filterItem.value.length === 0 ||
            !value.some((tag) => filterItem.value.includes(tag))
          );
        };
      },
      InputComponent: TagFilterValue,
    },
  ] as const;

  const columns = (playerData: PlayerData): GridColDef[] => [
    {
      field: "id",
      headerName: "Material",
      type: "string",
      filterOperators: getGridStringOperators().filter(
        (operator) =>
          operator.value !== "isEmpty" && operator.value !== "isNotEmpty"
      ),
      flex: 3,
    },
    {
      field: "tags",
      headerName: "Tags",
      type: "singleSelect",
      valueOptions: [...tags],
      filterOperators: tagFilerOperators,
      sortComparator: (v1, v2) => v1.join().localeCompare(v2.join()),
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            height: "inherit",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {params.value.map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              style={{
                backgroundColor: tagBgColor(tag),
                color: tagTextColor(tag),
              }}
            />
          ))}
        </Box>
      ),
      flex: 3,
    },
    ...playerData.map<GridColDef>(
      (player) =>
        ({
          field: `${player.id}.quantity`,
          headerName: `${player.name}`,
          type: "number",
          editable: true,
          // render cell with edit button
          renderCell: (params) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "right",
              }}
            >
              <IconButton
                size="small"
                onClick={() =>
                  params.api.startCellEditMode({
                    id: params.row.id,
                    field: params.field,
                  })
                }
              >
                <Edit fontSize="small" />
              </IconButton>
              {params.value || "-"}
            </Box>
          ),
          renderEditCell: (params) => <CustomEditNumberComponent {...params} />,
          sortComparator: (v1, v2) =>
            v1 === 0 || typeof v1 === "string"
              ? -1
              : v2 === 0 || typeof v2 === "string"
              ? 1
              : v1 - v2,
          filterOperators: getGridNumericOperators().filter(
            (operator) =>
              operator.value !== "isEmpty" &&
              operator.value !== "isNotEmpty" &&
              operator.value !== "isAnyOf"
          ),
        } as const)
    ),
    {
      field: "quantity",
      headerName: "Total",
      type: "number",
      valueGetter: (_value, row) =>
        playerData.reduce(
          (acc, player) => acc + (row[`${player.id}.quantity`] ?? 0),
          0
        ) || "-",
      sortComparator: (v1, v2) =>
        v1 === 0 || typeof v1 === "string"
          ? -1
          : v2 === 0 || typeof v2 === "string"
          ? 1
          : v1 - v2,
      filterOperators: getGridNumericOperators().filter(
        (operator) =>
          operator.value !== "isEmpty" &&
          operator.value !== "isNotEmpty" &&
          operator.value !== "isAnyOf"
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "string",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <RowActionsMenu
          editLootType={() => {
            setEditLootId(params.row.id as string);
            setEditLootDialogOpen(true)}
          }
          removeLootType={() => removeLootType(params.row.id as string)}
        />
      ),
      align: "right",
      flex: 1,
    },
  ];

  useEffect(() => {
    syncDataToLocalStorage(LOCAL_STORAGE_PLAYER_DATA_KEY, playerData);
  }, [playerData]);

  useEffect(() => {
    syncDataToLocalStorage(LOCAL_STORAGE_LOOT_DATA_KEY, lootData);
  }, [lootData]);

  return (
    <Layout
      addLootType={addLootType}
      currentTags={tags}
      configurePlayers={configurePlayers}
      currentPlayers={currentPlayers}
    >
      <Box sx={{ width: "100%", my: 2 }}>
        <DataGrid
          rows={rows(playerData)}
          columns={columns(playerData)}
          processRowUpdate={(updatedRow) => {
            const updatedPlayerData = playerData.map((player) => {
              const updatedQuantity = updatedRow[`${player.id}.quantity`];
              return {
                ...player,
                loot: {
                  ...player.loot,
                  [updatedRow.id]: {
                    quantity: updatedQuantity,
                  },
                },
              };
            }) as PlayerData;

            setPlayerData(updatedPlayerData);
            return updatedRow;
          }}
        />
      </Box>
      <LootFormDialog
        open={editLootDialogOpen}
        onClose={() => {
          setEditLootDialogOpen(false);
          setEditLootId(null);
        }}
        editLootType={editLootType}
        currentTags={tags}
        editData={
          editLootId ? { id: editLootId, ...lootData[editLootId] } : undefined
        }
      />
    </Layout>
  );
}
