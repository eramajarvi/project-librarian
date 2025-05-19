import "../styles/index.css";
import React, { useEffect, useState, type MouseEvent, type KeyboardEvent } from "react";
import { type Folder } from "../lib/dexie";

interface EditFolderProps {
	isOpen: boolean;
	title: string;
	folder: Folder;
	onAccept: (updatedFolder: Folder) => void;
	onCancel: () => void;
	onDeleteFolder: (folderId: string) => void;
	children?: React.ReactNode;
}

const emojiRegex =
	/^(?:\p{Emoji}|\p{Emoji_Modifier_Base}|\p{Emoji_Component}|\u200d|[#*0-9]\uFE0F\u20E3|\\u00a9|\\u00ae|\\u2122|\\u3030|\\u303d|\\u2700-\\u27BF|\\u2B00-\\u2BFF|\\u2900-\\u297F|\\u2500-\\u257F|\\u2580-\\u259F|\\u25A0-\\u25FF|\\u2600-\\u26FF|\\uFE00-\\uFE0F|\\uD83C[\uDC00-\uDFFF]|\\uD83D[\uDC00-\uDFFF]|\\uD83E[\uDC00-\uDFFF])+$/u;

const EditFolder: React.FC<EditFolderProps> = ({ isOpen, title, folder, onAccept, onCancel, onDeleteFolder }) => {
	const [folderName, setFolderName] = useState<string>("");
	const [emojiValue, setEmojiValue] = useState<string>("");
	const [nameError, setNameError] = useState<string | null>(null);

	// Efecto para inicializar/restablecer el estado cuando se abre el modal o cambia la carpeta prop
	useEffect(() => {
		if (isOpen) {
			setFolderName(folder.folder_name);

			if (folder.folder_emoji && emojiRegex.test(folder.folder_emoji)) {
				setEmojiValue(folder.folder_emoji);
			} else {
				setEmojiValue("");
			}
			setNameError(null);
		}
	}, [isOpen, folder]);

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFolderName(event.target.value);
		if (nameError && event.target.value.trim().length > 0) {
			setNameError(null);
		}
	};

	const handleEmojiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newEmojiInput = event.target.value;

		if (newEmojiInput === "" || emojiRegex.test(newEmojiInput)) {
			setEmojiValue(newEmojiInput.slice(0, 2));
		} else if (emojiValue && newEmojiInput.length < emojiValue.length) {
			setEmojiValue("");
		} else {
			setEmojiValue(""); // Limpia el valor si no es un emoji válido
		}
	};

	const strictHandleEmojiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const typedValue = event.target.value;
		if (typedValue === "") {
			setEmojiValue("");
		} else if (emojiRegex.test(typedValue)) {
			setEmojiValue(typedValue);
		}
	};

	if (!isOpen) {
		return null;
	}

	const validateAndAccept = () => {
		const trimmedName = folderName.trim();
		let isValid = true;

		if (trimmedName.length === 0) {
			setNameError("El nombre de la carpeta no puede estar vacío.");
			isValid = false;
		} else {
			setNameError(null);
		}

		if (isValid) {
			const updatedFolder: Folder = {
				...folder,
				folder_name: trimmedName,
				folder_emoji: emojiValue,
			};
			onAccept(updatedFolder);
		}
	};

	const handleDelete = () => {
		onDeleteFolder(folder.folder_id);
	};

	useEffect(() => {
		const handleEscKey = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};
		if (isOpen) {
			document.addEventListener("keydown", handleEscKey);
		}
		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [isOpen, onCancel]);

	const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	};

	const isSubmitDisabled = folderName.trim().length === 0;

	return (
		<>
			<div
				className="editar-carpeta-overlay"
				onClick={handleOverlayClick}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-body-content">
				<div className="editar-carpeta-content">
					<h2 id="modal-title" className="modal-title">
						{title}
					</h2>

					<div className="modal-body">
						<p>Cambia el emoji de la carpeta y su nombre. O elimínala.</p>
						<div className="folder-input-container">
							<div>
								<input
									type="text"
									className={`folder-emoji-input textfield`}
									placeholder="📂"
									maxLength={2}
									value={emojiValue}
									onChange={strictHandleEmojiChange}
									onBlur={(e) => {
										if (e.target.value !== "" && !emojiRegex.test(e.target.value)) {
											setEmojiValue("");
										}
									}}
									onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
										if (e.key === "Enter" && !isSubmitDisabled) {
											validateAndAccept();
										}
									}}
								/>
							</div>
							<div>
								<input
									type="text"
									id="FolderNameInput"
									value={folderName}
									maxLength={25}
									className={`folder-name-input textfield ${nameError ? "input-error" : ""}`}
									placeholder="nombre de la carpeta"
									autoFocus
									onChange={handleNameChange}
									onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
										if (e.key === "Enter" && !isSubmitDisabled) {
											validateAndAccept();
										}
									}}
								/>
								{nameError && <p className="error-message">{nameError}</p>}
							</div>
						</div>
						{/* {children} */}
					</div>

					<div className="modal-footer">
						<button className="base-button edit-button" onClick={onCancel}>
							Cancelar
						</button>
						<button className="base-button delete-button" onClick={handleDelete}>
							Eliminar carpeta
						</button>
						<button className="base-button accept-button" onClick={validateAndAccept} disabled={isSubmitDisabled}>
							Guardar cambios
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default EditFolder;
