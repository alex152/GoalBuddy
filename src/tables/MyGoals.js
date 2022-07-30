import {
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    Button,
    Box,
    Typography
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { setDoc, getDoc, doc, getFirestore } from "firebase/firestore/lite";
import { DialogContext } from "../DialogProvider";
import firebase from "../firebase"
import { useSelector } from "react-redux";
import { getDateStr } from "../dateUtils";

const todayStr = getDateStr();

export default function GoalsTable() {
    const [goals, setGoals] = useState([]);
    const { openDialog, closeDialog } = useContext(DialogContext);
    const user = useSelector(state => state.user.user);

    const db = getFirestore(firebase);
    useEffect(() => {
        if (!user) return;
        (async () => setGoals((await getDoc(doc(db, "users", user.email, "goals", todayStr))).data()?.goals ?? []))();
    }, [user]);

    return (
        <Box component={Paper} sx={{m: "1em", p: "1em"}}>
            <Typography variant="h4">Today's Goals</Typography>
            {goals.length ? <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow >
                            <TableCell sx={{width: "16em"}}>Goals</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {goals.map((item, idx) => (
                            <TableRow key={idx} >
                                <TableCell>{item.goal}</TableCell>
                                <TableCell
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => openDialog((
                                        <Dialog open={true} onClose={closeDialog} fullWidth >
                                            <form onSubmit={e => {
                                                e.preventDefault();
                                                const proof = e.target.proof.value;
                                                if (!proof) return;
                                                const updatedGoals = goals.map((g, i) => (i !== idx) ? g : { ...g, proof });
                                                setDoc(doc(db, "users", user.email, "goals", todayStr), { goals: updatedGoals });
                                                setGoals(updatedGoals);
                                                closeDialog();
                                            }}>
                                                <DialogTitle>Modify Goal Achievement</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText>Fill in how the goal was achieved, this will be validated by your buddy.</DialogContentText>
                                                    <TextField
                                                        name="proof"
                                                        autoFocus
                                                        margin="dense"
                                                        label="Achievement Proof"
                                                        fullWidth
                                                        defaultValue={item.proof}
                                                    />
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={closeDialog}>Cancel</Button>
                                                    <Button variant="contained" type="submit">Save</Button>
                                                </DialogActions>
                                            </form>
                                        </Dialog>
                                    ))}
                                >{item.proof}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer> : <Typography variant="h6">You don't have any goals set for today</Typography>}
        </Box>
    )
}