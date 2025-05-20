import "../styles/index.css";
import React, { useState, useEffect, type MouseEvent, type KeyboardEvent } from "react";

export interface NewFolderData {
	folder_name: string;
	folder_emoji: string;
}

interface AddFolderProps {
	isOpen: boolean;
	title: string;
	onAccept: (newFolderData: NewFolderData) => void;
	onCancel: () => void;
	acceptLabel?: string;
	cancelLabel?: string;
	children?: React.ReactNode;
}

const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;

const AddFolder: React.FC<AddFolderProps> = ({
	isOpen,
	title,
	onAccept,
	onCancel,
	acceptLabel = "Añadir carpeta",
	cancelLabel = "Cancelar",
	children,
}) => {
	const [folderName, setFolderName] = useState<string>("");
	const [emojiValue, setEmojiValue] = useState<string>("📂"); // Default emoji

	useEffect(() => {
		if (isOpen) {
			setFolderName("");
			setEmojiValue("📂");
		}
	}, [isOpen]);

	if (!isOpen) {
		return null;
	}

	const handleAccept = () => {
		if (!folderName.trim()) {
			alert("El nombre de la carpeta no puede estar vacío.");
			return;
		}

		const handleEmojiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const emojiInput = event.target.value;

			if (emojiRegex.test(emojiInput)) {
				setEmojiValue(emojiInput);
			} else {
				setEmojiValue("");
			}
		};

		const newFolderData: NewFolderData = {
			folder_name: folderName.trim(),
			folder_emoji: emojiValue,
		};
		onAccept(newFolderData);
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

	return (
		<>
			<div
				className="editar-carpeta-overlay"
				onClick={handleOverlayClick}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title-add">
				<div className="editar-carpeta-content">
					{" "}
					<h2 id="modal-title-add" className="modal-title">
						{title}
					</h2>
					<div className="modal-body">
						<p>Elige un emoji y el nombre para tu nueva carpeta.</p>
						<input
							type="text"
							className="folder-emoji-input textfield"
							placeholder=""
							maxLength={2}
							value={emojiValue}
							onChange={(e) => setEmojiValue(e.target.value)}
						/>
						<input
							type="text"
							id="NewFolderNameInput"
							value={folderName}
							maxLength={25}
							className="folder-name-input textfield"
							placeholder="nombre de la carpeta"
							autoFocus
							onChange={(e) => setFolderName(e.target.value)}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter") {
									handleAccept();
								}
							}}
						/>
						{children}
					</div>
					<div className="modal-footer">
						<button className="base-button edit-button" onClick={onCancel}>
							{cancelLabel}
						</button>
						<button className="base-button accept-button" onClick={handleAccept}>
							{acceptLabel}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddFolder;
