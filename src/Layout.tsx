import { ThemeProvider } from "@emotion/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddCircleOutline,
  DownloadOutlined,
  Restore,
  SettingsOutlined,
  UploadFile,
} from "@mui/icons-material";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Dialog,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import React, { ReactNode, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Loot } from "./data/initialLoot";

interface LayoutProps {
  children: ReactNode; // This ensures that children can be passed as a prop
}

const OptionsMenu: React.FC<{
  openAddLootDialog: () => void;
  openConfigurePlayersDialog: () => void;
}> = ({ openAddLootDialog, openConfigurePlayersDialog }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mhw-board-game-data.json";
    a.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const parsedData = JSON.parse(data as string);
          for (const key in parsedData) {
            localStorage.setItem(key, parsedData[key]);
          }
          window.location.reload();
        }
      };
      reader.readAsText(file);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuItemClick = () => {
    fileInputRef.current?.click();
  };

  const resetLocalStorage = () => {
    handleDownload();
    localStorage.clear();
    window.location.reload();
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
            openAddLootDialog();
            handleClose();
          }}
        >
          <ListItemIcon>
            <AddCircleOutline />
          </ListItemIcon>
          <ListItemText>Add Loot Type</ListItemText>
        </MenuItem>

        <Divider />
        <MenuItem
          onClick={() => {
            openConfigurePlayersDialog();
            handleClose();
          }}
        >
          <ListItemIcon>
            <SettingsOutlined />
          </ListItemIcon>
          <ListItemText>Configure Players</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadOutlined />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuItemClick}>
          <ListItemIcon>
            <UploadFile />
          </ListItemIcon>
          <ListItemText>Import Data</ListItemText>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </MenuItem>
        <MenuItem onClick={resetLocalStorage}>
          <ListItemIcon>
            <Restore />
          </ListItemIcon>
          <ListItemText>Reset Data</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

const lootSchema = z.object({
  id: z.string().min(1, { message: "Name is required" }),
  tags: z.array(z.string()),
});
type AddLootFormFields = z.infer<typeof lootSchema>;

const LootTypeForm: React.FC<{
  editLootType: (id: string, loot: Loot) => void;
  defaultData?: AddLootFormFields;
  currentTags: string[];
}> = ({ editLootType: addLootType, currentTags, defaultData }) => {
  const { control, handleSubmit } = useForm<AddLootFormFields>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(lootSchema),
    defaultValues: defaultData ?? {
      id: "",
      tags: [],
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ id, tags }) => addLootType(id, { tags }))}
    >
      <Box sx={{ display: "flex", gap: "1rem", p: "1rem" }}>
        <Controller
          name="id"
          control={control}
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <FormControl>
              <TextField
                name="name"
                label="Name"
                placeholder="Monster Bone"
                inputRef={ref}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={Boolean(error)}
                required
              />
              <FormHelperText
                sx={{
                  color: "error.main",
                }}
              >
                {error?.message ?? ""}
              </FormHelperText>
            </FormControl>
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <FormControl style={{ width: "20rem" }}>
              <Autocomplete
                multiple
                id="tags"
                options={currentTags}
                freeSolo
                disableClearable
                autoSelect
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    error={Boolean(error)}
                  />
                )}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                onBlur={onBlur}
                ref={ref}
              />
              <FormHelperText
                sx={{
                  color: "error.main",
                }}
              >
                {error?.message ?? ""}
              </FormHelperText>
            </FormControl>
          )}
        />
        <Button type="submit">Submit</Button>
      </Box>
    </form>
  );
};

const configurePlayersSchema = z.object({
  "1": z.string().min(1, { message: "Player 1's name is required" }),
  "2": z.string().optional(),
  "3": z.string().optional(),
  "4": z.string().optional(),
});
type ConfigurePlayersFormFields = z.infer<typeof configurePlayersSchema>;

const ConfigurePlayers: React.FC<{
  configurePlayers: (players: ConfigurePlayersFormFields) => void;
  currentPlayers: ConfigurePlayersFormFields;
}> = ({ configurePlayers, currentPlayers }) => {
  const { control, handleSubmit } = useForm<ConfigurePlayersFormFields>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(configurePlayersSchema),
    defaultValues: currentPlayers,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((config) =>
        configurePlayers(
          Object.fromEntries(
            Object.entries(config).filter(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ([_, name]) => typeof name === "string" && name !== ""
            )
          ) as ConfigurePlayersFormFields
        )
      )}
    >
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          p: "1rem",
          flexDirection: "column",
        }}
      >
        {([1, 2, 3, 4] as const).map((playerNumber) => (
          <Controller
            key={playerNumber}
            name={`${playerNumber}`}
            control={control}
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <FormControl>
                <TextField
                  name={`player${playerNumber}Name`}
                  label={`Player ${playerNumber}'s Name`}
                  placeholder={`Player ${playerNumber}`}
                  inputRef={ref}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  required={playerNumber === 1}
                />
                <FormHelperText
                  sx={{
                    color: "error.main",
                  }}
                >
                  {error?.message ?? ""}
                </FormHelperText>
              </FormControl>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </Box>
    </form>
  );
};

interface AddLootDialogProps {
  open: boolean;
  onClose: () => void;
  editLootType: (newId: string, loot: Loot, oldId: string) => void;
  currentTags: string[];
  editData?: AddLootFormFields;
}

export const LootFormDialog = ({
  onClose,
  open,
  editLootType,
  currentTags,
  editData,
}: AddLootDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{editData ? "Edit" : "Add"} Loot</DialogTitle>
      <LootTypeForm
        editLootType={(id, tags) => {
          editLootType(id, tags, editData?.id ?? id);
          handleClose();
        }}
        currentTags={currentTags}
        defaultData={editData}
      />
    </Dialog>
  );
};

interface ConfigurePlayersDialogProps {
  open: boolean;
  onClose: () => void;
  configurePlayers: (players: ConfigurePlayersFormFields) => void;
  currentPlayers: ConfigurePlayersFormFields;
}

const ConfigurePlayersDialog = ({
  onClose,
  open,
  configurePlayers,
  currentPlayers,
}: ConfigurePlayersDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Configure Players</DialogTitle>
      <ConfigurePlayers
        configurePlayers={(players) => {
          configurePlayers(players);
          handleClose();
        }}
        currentPlayers={currentPlayers}
      />
    </Dialog>
  );
};

const Layout: React.FC<
  LayoutProps & {
    addLootType: (id: string, loot: Loot) => void;
    currentTags: string[];
    configurePlayers: (players: ConfigurePlayersFormFields) => void;
    currentPlayers: ConfigurePlayersFormFields;
  }
> = ({
  children,
  addLootType,
  currentTags,
  configurePlayers,
  currentPlayers,
}) => {
  const currentYear = new Date().getFullYear();
  const userDefaultTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [darkMode] = useState<boolean>(userDefaultTheme);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });
  const [addLootDialogOpen, setAddLootDialogOpen] = useState(false);
  const [configurePlayersDialogOpen, setConfigurePlayersDialogOpen] =
    useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply global CSS normalization */}
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <AppBar position="sticky">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" component="div">
              Monster Hunter World Board Game - Loot Tracker
            </Typography>
            <OptionsMenu
              openAddLootDialog={() => setAddLootDialogOpen(true)}
              openConfigurePlayersDialog={() =>
                setConfigurePlayersDialogOpen(true)
              }
            />
            <LootFormDialog
              open={addLootDialogOpen}
              onClose={() => setAddLootDialogOpen(false)}
              editLootType={addLootType}
              currentTags={currentTags}
            />
            <ConfigurePlayersDialog
              open={configurePlayersDialogOpen}
              onClose={() => setConfigurePlayersDialogOpen(false)}
              configurePlayers={configurePlayers}
              currentPlayers={currentPlayers}
            />
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Container maxWidth="lg">{children}</Container>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ padding: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {currentYear}{" "}
            <Link href="https://timjames.dev">timjames.dev</Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
