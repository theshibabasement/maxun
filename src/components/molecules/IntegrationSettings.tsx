import React, { useState, useEffect } from 'react';
import { GenericModal } from "../atoms/GenericModal";
import { MenuItem, Typography, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from 'axios';
import { useGlobalInfoStore } from '../../context/globalInfo';
import { getStoredRecording } from '../../api/storage';

interface IntegrationProps {
    isOpen: boolean;
    handleStart: (data: IntegrationSettings) => void;
    handleClose: () => void;
}

export interface IntegrationSettings {
    spreadsheetId: string;
    data: string;
}

export const IntegrationSettingsModal = ({ isOpen, handleStart, handleClose }: IntegrationProps) => {
    const [settings, setSettings] = useState<IntegrationSettings>({
        spreadsheetId: '',
        data: '',
    });

    const [spreadsheets, setSpreadsheets] = useState<{ id: string, name: string }[]>([]);
    const [userInfo, setUserInfo] = useState<{ email: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleSheetsEmail, setGoogleSheetsEmail] = useState<string | null>(null);
    const [googleSheetId, setGoogleSheetId] = useState<string | null>(null); // Store the integrated sheet ID
    const [googleSheetName, setGoogleSheetName] = useState<string | null>(null); // Store the integrated sheet name

    const { recordingId } = useGlobalInfoStore();

    // Function to trigger Google OAuth authentication
    const authenticateWithGoogle = () => {
        window.location.href = `http://localhost:8080/auth/google?robotId=${recordingId}`;
    };

    // Function to handle Google OAuth callback and fetch spreadsheets
    const handleOAuthCallback = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/auth/google/callback`);
            const { google_sheet_email, files } = response.data;
            setUserInfo({ email: google_sheet_email });
        } catch (error) {
            setError('Error authenticating with Google');
        }
    };

    const fetchSpreadsheetFiles = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/auth/gsheets/files?robotId=${recordingId}`, {
                withCredentials: true,
            });
            setSpreadsheets(response.data);
        } catch (error: any) {
            console.error('Error fetching spreadsheet files:', error.response?.data?.message || error.message);
        }
    };

    // Handle spreadsheet selection
    const handleSpreadsheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedSheet = spreadsheets.find(sheet => sheet.id === e.target.value);
        if (selectedSheet) {
            setGoogleSheetId(selectedSheet.id);
            setGoogleSheetName(selectedSheet.name);
        }
        setSettings({ ...settings, spreadsheetId: e.target.value });
    };

    useEffect(() => {
        // Check if we're on the callback URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            handleOAuthCallback();
        }

        // Fetch the stored recording to check the Google Sheets email and google_sheet_id
        const fetchRecordingInfo = async () => {
            if (!recordingId) return;
            const recording = await getStoredRecording(recordingId);
            if (recording) {
                setGoogleSheetsEmail(recording.google_sheet_email);
                setGoogleSheetId(recording.google_sheet_id); 
                setGoogleSheetName(recording.google_sheet_id); 
            }
        };

        fetchRecordingInfo();
    }, [recordingId]);

    return (
        <GenericModal isOpen={isOpen} onClose={handleClose}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '65px' }}>
                <Typography sx={{ margin: '20px 0px' }}>Google Sheets Integration</Typography>

                {/* Check if Google Sheet is already integrated */}
                {googleSheetId ? (
                    <Typography sx={{ marginBottom: '10px' }}>
                        Google Sheet Integrated Successfully!
                        <br />
                        Sheet Name: {googleSheetName}
                        <br />
                        Sheet ID: {googleSheetId}
                    </Typography>
                ) : (
                    <>
                        {/* If Google Sheets email is empty, show Google OAuth button */}
                        {!googleSheetsEmail ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={authenticateWithGoogle}
                                style={{ marginBottom: '15px' }}
                            >
                                Authenticate with Google
                            </Button>
                        ) : (
                            <>
                                {/* Show user info and allow spreadsheet selection once authenticated */}
                                {userInfo && (
                                    <Typography sx={{ marginBottom: '10px' }}>
                                        Logged in as: {userInfo.email}
                                    </Typography>
                                )}

                                {loading ? (
                                    <CircularProgress sx={{ marginBottom: '15px' }} />
                                ) : error ? (
                                    <Typography color="error">{error}</Typography>
                                ) : spreadsheets.length === 0 ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={fetchSpreadsheetFiles}
                                        style={{ marginBottom: '15px' }}
                                    >
                                        Fetch Google Spreadsheets
                                    </Button>
                                ) : (
                                    <>
                                        {/* Dropdown for selecting the Google Sheet */}
                                        <TextField
                                            sx={{ marginBottom: '15px' }}
                                            select
                                            label="Select Google Spreadsheet"
                                            required
                                            value={settings.spreadsheetId}
                                            onChange={handleSpreadsheetSelect}
                                            fullWidth
                                        >
                                            {spreadsheets.map(sheet => (
                                                <MenuItem key={sheet.id} value={sheet.id}>
                                                    {sheet.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        {/* Display selected spreadsheet name and ID */}
                                        {settings.spreadsheetId && (
                                            <Typography sx={{ marginBottom: '10px' }}>
                                                Selected Sheet: {googleSheetName} (ID: {settings.spreadsheetId})
                                            </Typography>
                                        )}

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleStart(settings)}
                                            style={{ marginTop: '10px' }}
                                            disabled={!settings.spreadsheetId || loading}
                                        >
                                            Submit
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </GenericModal>
    );
};
