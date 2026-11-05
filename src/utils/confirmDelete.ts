import Swal from "sweetalert2";

interface ConfirmDeleteOptions {
  /** What is being deleted, e.g. "this blog" or `"${name}"`. */
  itemName?: string;
  title?: string;
  text?: string;
  confirmButtonText?: string;
}

/**
 * Shows a delete confirmation box and resolves to true only if the user
 * clicks the confirm button. Use before every delete/remove action.
 */
export const confirmDelete = async ({
  itemName = "this item",
  title,
  text,
  confirmButtonText = "Yes, Delete",
}: ConfirmDeleteOptions = {}): Promise<boolean> => {
  const result = await Swal.fire({
    title: title ?? "Delete?",
    text: text ?? `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#E0E0E0",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      container: "swal-top-container",
      popup: "swal-rounded-popup",
      confirmButton: "swal-rounded-button",
      cancelButton: "swal-rounded-button swal-cancel-button",
    },
  });

  return result.isConfirmed;
};

export default confirmDelete;
