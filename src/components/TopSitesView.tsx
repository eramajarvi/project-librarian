import "../styles/index.css";
import React, { useState, useEffect } from "react";

import { useUser } from "@clerk/clerk-react";
import BookmarksFolders from "./BookmarksFolders";
import Curve from "./Curve";
import EditFolder from "./EditFolder";
import AddFolder, { type NewFolderData } from "./AddFolder";

import {
	addNewFolder as serviceAddNewFolder,
	updateFolder as serviceUpdateFolder,
	deleteFolder as serviceDeleteFolder,
	getFoldersForUser as serviceGetFoldersForUser,
	getFolderById as serviceGetFolderById,
	type Folder,
} from "../lib/folderService";

interface ViewManagerProps {}

function TopSitesView({}: ViewManagerProps) {
	const { isSignedIn, user, isLoaded } = useUser();

	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
	const [initialFolderLoaded, setInitialFolderLoaded] = useState(false);
	const [folders, setFolders] = useState<Folder[]>([]);

	const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
	const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);

	const isOwner = isSignedIn && user;

	// --- Editar Carpeta Handlers ---
	const handleOpenEditFolder = () => {
		if (selectedFolder) setIsEditFolderOpen(true);
	};
	const handleCloseEditFolder = () => setIsEditFolderOpen(false);

	const handleAcceptEditFolder = async (updatedFolderDataFromModal: Folder) => {
		if (!selectedFolder || !selectedFolder.folder_id) {
			console.error("Ninguna carpeta seleccionada para editar");
			handleCloseEditFolder();
			return;
		}
		try {
			const updates: Partial<Pick<Folder, "folder_name" | "folder_emoji" | "updated_at">> = {
				folder_name: updatedFolderDataFromModal.folder_name,
				folder_emoji: updatedFolderDataFromModal.folder_emoji,
				updated_at: updatedFolderDataFromModal.updated_at,
			};
			const updatedFolder = await serviceUpdateFolder(selectedFolder.folder_id, updates);
			setSelectedFolder(updatedFolder);
			// Actualizar la lista de carpetas localmente si es necesario
			setFolders((prev) => prev.map((f) => (f.folder_id === updatedFolder.folder_id ? updatedFolder : f)));
		} catch (error) {
			console.error("Error al actualizar la carpeta:", error);
			// mostrar un mensaje de error al usuario
		}
		handleCloseEditFolder();
	};

	// --- Añadir Carpeta Handlers ---
	const handleOpenAddFolder = () => setIsAddFolderOpen(true);
	const handleCloseAddFolder = () => setIsAddFolderOpen(false);

	const handleAcceptAddFolder = async (newFolderDetails: NewFolderData) => {
		if (!user || !user.id) {
			console.error("El usuario no ha iniciado sesión. No se puede añadir una carpeta.");
			handleCloseAddFolder();
			return;
		}

		try {
			const newlyAddedFolder = await serviceAddNewFolder(newFolderDetails, user.id);

			setFolders((prev) =>
				[...prev, newlyAddedFolder].sort((a, b) => {
					const dateA = new Date(a.created_at).getTime();
					const dateB = new Date(b.created_at).getTime();
					return dateA - dateB;
				})
			);
			setCurrentFolderId(newlyAddedFolder.folder_id); // Hacer la nueva carpeta la seleccionada
			// la selectedFolder se actualizará por el useEffect que escucha currentFolderId
		} catch (error) {
			console.error("Error al añadir la carpeta:", error);
		}
		handleCloseAddFolder();
	};

	// --- Delete Folder Handler ---
	const handleDeleteFolder = async (folderIdToDelete: string) => {
		if (!selectedFolder || selectedFolder.folder_id !== folderIdToDelete || !user) {
			handleCloseEditFolder();
			return;
		}
		if (window.confirm(`¿Tienes la certeza de que quieres eliminar la carpeta "${selectedFolder.folder_name}"?`)) {
			try {
				await serviceDeleteFolder(folderIdToDelete);
				setFolders((prev) => prev.filter((f) => f.folder_id !== folderIdToDelete));
				setCurrentFolderId(null); // Hace que la carpeta seleccionada sea null
				// selectedFolder se actualizará por el useEffect que escucha currentFolderId
				setSelectedFolder(null);
				setInitialFolderLoaded(false);
			} catch (error) {
				console.error("Error al eliminar la carpeta:", error);
			}
		}
		handleCloseEditFolder();
	};

	// Efecto para cargar las carpetas iniciales del usuario y establecer la selección
	useEffect(() => {
		async function loadUserFolders() {
			if (isLoaded && user && user.id) {
				const userFolders = await serviceGetFoldersForUser(user.id);
				setFolders(userFolders);

				if (userFolders.length > 0) {
					// Si currentFolderId es null (por ejemplo, después de eliminar o carga inicial), establecer la primera carpeta como la seleccionada
					if (currentFolderId === null || !userFolders.find((f) => f.folder_id === currentFolderId)) {
						setCurrentFolderId(userFolders[0].folder_id);
					}
				} else {
					setCurrentFolderId(null);
					setSelectedFolder(null);
				}
				setInitialFolderLoaded(true);
			} else if (isLoaded && !user) {
				setFolders([]);
				setCurrentFolderId(null);
				setSelectedFolder(null);
				setInitialFolderLoaded(true);
			}
		}

		if (!initialFolderLoaded || (currentFolderId === null && folders.length > 0)) {
			loadUserFolders();
		}
	}, [isLoaded, user, initialFolderLoaded, currentFolderId]);

	// Efecto para obtener el objeto de carpeta seleccionado cuando currentFolderId cambia
	useEffect(() => {
		async function fetchSelectedFolderObject() {
			if (currentFolderId && user && user.id) {
				const folderFromState = folders.find((f) => f.folder_id === currentFolderId);
				if (folderFromState) {
					setSelectedFolder(folderFromState);
				} else {
					const folderFromDb = await serviceGetFolderById(currentFolderId);
					if (folderFromDb && folderFromDb.user_id === user.id) {
						setSelectedFolder(folderFromDb);
					} else {
						setSelectedFolder(null);
						console.warn(`Folder with ID ${currentFolderId} not found or access denied.`);
						// setCurrentFolderId(null);
					}
				}
			} else {
				setSelectedFolder(null);
			}
		}
		if (initialFolderLoaded || currentFolderId) {
			fetchSelectedFolderObject();
		}
	}, [currentFolderId, initialFolderLoaded, user, folders]);

	const handleFolderSelect = (folderId: string) => {
		setCurrentFolderId(folderId);
	};

	if (!isLoaded) {
		return <div>Loading user information...</div>;
	}

	return (
		<div className="topsites-container">
			<Curve selectedFolderId={currentFolderId} />

			<BookmarksFolders onFolderSelect={handleFolderSelect} initiallySelectedFolderId={currentFolderId || ""} />

			<div className="actions-button-container">
				{isOwner && selectedFolder && (
					<button className="base-button edit-button" onClick={handleOpenEditFolder}>
						Editar
					</button>
				)}

				{isOwner && (
					<button className="base-button edit-button add-button" onClick={handleOpenAddFolder}>
						Añadir carpeta
					</button>
				)}
			</div>

			{isEditFolderOpen && selectedFolder && isOwner && (
				<EditFolder
					isOpen={isEditFolderOpen}
					title={`Editar: ${selectedFolder.folder_name}`}
					folder={selectedFolder}
					onAccept={handleAcceptEditFolder}
					onCancel={handleCloseEditFolder}
					onDeleteFolder={handleDeleteFolder}
				/>
			)}

			{isAddFolderOpen && isOwner && (
				<AddFolder
					isOpen={isAddFolderOpen}
					title="Crear Nueva Carpeta"
					onAccept={handleAcceptAddFolder}
					onCancel={handleCloseAddFolder}
				/>
			)}
		</div>
	);
}

export default TopSitesView;
