import {
  useState,
  useEffect,
} from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from "@mui/material";

import Sidebar from "../components/Sidebar";

import {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} from "../services/itemService";

export default function ItemPage() {
  const [success, setSuccess] =
    useState(false);

  const [deleteSuccess, setDeleteSuccess] =
    useState(false);

  const [items, setItems] =
    useState([]);

  const [editId, setEditId] =
    useState(null);

const [formData, setFormData] = useState({
  itemNumber: "",
  itemName: "",
  itemType: "RM",
  outlet: "",
  unitOfMeasure: "",
});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems =
    async () => {
      try {
        const data =
          await getItems();

        setItems(data);
      } catch (error) {
        console.log(error);
      }
    };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const resetForm = () => {
  setFormData({
    itemNumber: "",
    itemName: "",
    itemType: "RM",
    outlet: "",
    unitOfMeasure: "",
  });

  setEditId(null);
};

  const handleSubmit =
    async () => {
      try {
        if (editId) {
          await updateItem(
            editId,
            formData
          );
        } else {
          await createItem(
            formData
          );
        }

        setSuccess(true);

        loadItems();

        resetForm();
      } catch (error) {
        console.log(error);
      }
    };

  const handleEdit = (
    item
  ) => {
    setEditId(item._id);

    setFormData({
  itemNumber: item.itemNumber,
  itemName: item.itemName,
  itemType: item.itemType,
  outlet: item.outlet,
  unitOfMeasure: item.unitOfMeasure,
});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Delete this item?"
        );

      if (!confirmDelete)
        return;

      try {
        await deleteItem(id);

        setDeleteSuccess(
          true
        );

        loadItems();
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* FORM CARD */}

        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius:
              "20px",
            border:
              "1px solid #E5E7EB",
            boxShadow:
              "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            mb={1}
          >
            Item Master
          </Typography>

          <Typography
            sx={{
              color:
                "#6B7280",
              mb: 4,
            }}
          >
            Create and manage
            inventory items
          </Typography>

          <Grid container spacing={3}>

  <Grid size={{ xs: 12, md: 2.4 }}>
    <TextField
      fullWidth
      label="Item Number"
      name="itemNumber"
      value={formData.itemNumber}
      onChange={handleChange}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 2.4 }}>
    <TextField
      fullWidth
      label="Item Name"
      name="itemName"
      value={formData.itemName}
      onChange={handleChange}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 2.4 }}>
    <TextField
      select
      fullWidth
      label="Item Type"
      name="itemType"
      value={formData.itemType}
      onChange={handleChange}
    >
      <MenuItem value="RM">RM</MenuItem>
      <MenuItem value="FG">FG</MenuItem>
    </TextField>
  </Grid>

  <Grid size={{ xs: 12, md: 2.4 }}>
    <TextField
      fullWidth
      label="OutTurn"
      name="outlet"
      value={formData.outlet}
      onChange={handleChange}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 2.4 }}>
    <TextField
      fullWidth
      label="Unit Of Measure"
      name="unitOfMeasure"
      value={formData.unitOfMeasure}
      onChange={handleChange}
    />
  </Grid>

</Grid>

          <Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  }}
>
  <Button
    variant="outlined"
    onClick={resetForm}
    sx={{
      minWidth: 120,
      height: 44,
      borderRadius: "10px",
      textTransform: "none",
    }}
  >
    Cancel
  </Button>

  <Button
    variant="contained"
    onClick={handleSubmit}
    sx={{
      minWidth: 140,
      height: 44,
      bgcolor: "#111827",
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 600,
      "&:hover": {
        bgcolor: "#0F172A",
      },
    }}
  >
    {editId ? "Update Item" : "Save Item"}
  </Button>
</Box>
        </Paper>

        {/* TABLE */}

        <Paper
          sx={{
            mt: 4,
            borderRadius:
              "20px",
            overflow:
              "hidden",
            boxShadow:
              "0px 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Item Number
                  </TableCell>

                  <TableCell>
                    Item Name
                  </TableCell>

                  <TableCell>
                    Item Type
                  </TableCell>

                 <TableCell>OutTurn</TableCell>

<TableCell>Unit</TableCell>

                  <TableCell>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map(
                  (item) => (
                    <TableRow
                      key={
                        item._id
                      }
                    >
                      <TableCell>
                        {
                          item.itemNumber
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.itemName
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.itemType
                        }
                      </TableCell>

                     <TableCell>
  {item.outlet}
</TableCell>

<TableCell>
  {item.unitOfMeasure}
</TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            mr: 1,
                            bgcolor:
                              "#111827",
                          }}
                          onClick={() =>
                            handleEdit(
                              item
                            )
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleDelete(
                              item._id
                            )
                          }
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* SAVE MESSAGE */}

        <Snackbar
          open={success}
          autoHideDuration={
            5000
          }
          onClose={() =>
            setSuccess(
              false
            )
          }
          anchorOrigin={{
            vertical:
              "top",
            horizontal:
              "right",
          }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() =>
              setSuccess(
                false
              )
            }
          >
            {editId
              ? "Item Updated Successfully"
              : "Item Saved Successfully"}
          </Alert>
        </Snackbar>

        {/* DELETE MESSAGE */}

        <Snackbar
          open={
            deleteSuccess
          }
          autoHideDuration={
            5000
          }
          onClose={() =>
            setDeleteSuccess(
              false
            )
          }
          anchorOrigin={{
            vertical:
              "top",
            horizontal:
              "right",
          }}
        >
          <Alert
            severity="success"
            variant="filled"
          >
            Item Deleted Successfully
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}