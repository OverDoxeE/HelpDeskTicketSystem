import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { createUser, deleteUser, fetchUsers, updateUser } from "../api/usersApi";

function getRole(user) {
  if (!user) return "ANON";
  if (user.is_superuser || (user.groups || []).includes("ADMIN")) return "ADMIN";
  if ((user.groups || []).includes("TECHNICIAN")) return "TECHNICIAN";
  return "USER";
}

function UserPanelPage() {
  const { user } = useAuth();
  const { showFlash } = useUi();

  const role = useMemo(() => getRole(user), [user]);
  const isAdmin = role === "ADMIN";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
    is_active: true,
  });
  const [createErr, setCreateErr] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const loadUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch users failed", e);
      setError("Unable to load users. Make sure you are logged in as ADMIN.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleRowChange = (userId, patch) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...patch, _dirty: true } : u))
    );
  };

  const handleSave = async (row) => {
    setError("");
    try {
      const payload = {
        role: row.role,
        is_active: row.is_active,
      };
      const updated = await updateUser(row.id, payload);
      setUsers((prev) =>
        prev.map((u) => (u.id === row.id ? { ...updated, _dirty: false } : u))
      );
      showFlash("success", `Saved changes for ${row.username}`);
    } catch (e) {
      console.error("Update user failed", e);
      setError("Failed to save user changes.");
      showFlash("error", "Failed to save user changes.");
    }
  };

  const handleDelete = async (row) => {
    setError("");
    const ok = window.confirm(
      `Delete user "${row.username}"? This action cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteUser(row.id);
      setUsers((prev) => prev.filter((u) => u.id !== row.id));
      showFlash("success", `Deleted user ${row.username}`);
    } catch (e) {
      console.error("Delete user failed", e);
      setError("Failed to delete user.");
      showFlash("error", "Failed to delete user.");
    }
  };

  const openCreate = () => {
    setCreateErr("");
    setCreateForm({
      username: "",
      email: "",
      password: "",
      role: "USER",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    setCreateErr("");
    const { username, email, password, role: newRole } = createForm;
    if (!username || !email || !password || !newRole) {
      setCreateErr("Please fill in username, email, password and role.");
      return;
    }
    setCreateBusy(true);
    try {
      const created = await createUser(createForm);
      setUsers((prev) => [{ ...created, _dirty: false }, ...prev]);
      setCreateOpen(false);
      showFlash("success", `Created user ${created.username}`);
    } catch (e) {
      console.error("Create user failed", e);
      setCreateErr("Failed to create user. Check if username/email is unique.");
      showFlash("error", "Failed to create user.");
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        User Panel
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account
              </Typography>
              <Typography>
                <strong>Username:</strong> {user?.username}
              </Typography>
              <Typography>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography>
                <strong>Role:</strong> {role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Notes
              </Typography>
              {isAdmin ? (
                <Typography color="text.secondary">
                  As an <strong>ADMIN</strong>, you can manage users below (create,
                  change role, activate/deactivate, delete).
                </Typography>
              ) : (
                <Typography color="text.secondary">
                  This page shows your basic account information. User management
                  is available only for <strong>ADMIN</strong>.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ADMIN: user management */}
      {isAdmin && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              User management
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" onClick={loadUsers} disabled={loading}>
                Refresh
              </Button>
              <Button variant="contained" onClick={openCreate}>
                Add user
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf = user?.id === u.id;
                      return (
                        <TableRow key={u.id}>
                          <TableCell>{u.username}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <InputLabel id={`role-${u.id}`}>Role</InputLabel>
                              <Select
                                labelId={`role-${u.id}`}
                                label="Role"
                                value={u.role || "USER"}
                                onChange={(e) =>
                                  handleRowChange(u.id, { role: e.target.value })
                                }
                              >
                                <MenuItem value="USER">USER</MenuItem>
                                <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={Boolean(u.is_active)}
                              onChange={(e) =>
                                handleRowChange(u.id, { is_active: e.target.checked })
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={!u._dirty}
                                onClick={() => handleSave(u)}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={isSelf}
                                onClick={() => handleDelete(u)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Create user dialog */}
          <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add user</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              {createErr && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {createErr}
                </Alert>
              )}
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={createForm.username}
                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
              />
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="create-role">Role</InputLabel>
                <Select
                  labelId="create-role"
                  label="Role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <MenuItem value="USER">USER</MenuItem>
                  <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Switch
                  checked={Boolean(createForm.is_active)}
                  onChange={(e) => setCreateForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <Typography>Active</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateOpen(false)} disabled={createBusy}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={submitCreate}
                disabled={createBusy}
                endIcon={createBusy ? <CircularProgress size={18} color="inherit" /> : null}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}

export default UserPanelPage;
