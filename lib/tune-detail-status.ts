export type TuneDetailStatusMessageInput = {
  editRequest: string
  commentReport: string
  loreReport: string
  lore: string
  moderatorEdit: string
  referenceUrl: string
  diary: string
  loop: string
  pageOptions: string
  listAdd: string
}

export function getSingleSearchParamValue(
  value: string | string[] | undefined
) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export function getTuneDetailStatusMessage({
  editRequest,
  commentReport,
  loreReport,
  lore,
  moderatorEdit,
  referenceUrl,
  diary,
  loop,
  pageOptions,
  listAdd,
}: TuneDetailStatusMessageInput) {
  if (editRequest === "success") return "Edit request submitted."
  if (editRequest === "empty") return "Add at least one proposed change."
  if (editRequest === "invalid_key") return "That key is not valid."
  if (editRequest === "invalid_url") return "That reference URL is not valid."
  if (editRequest === "error") return "Could not submit edit request."

  if (commentReport === "success") return "Comment report submitted."
  if (commentReport === "invalid_reason") return "Choose a report reason."
  if (commentReport === "own_comment") return "You cannot report your own comment."
  if (commentReport === "already_hidden") return "That comment is already hidden."
  if (commentReport === "error") return "Could not submit comment report."

  if (loreReport === "success") return "Lore report submitted."
  if (loreReport === "invalid_reason") return "Choose a lore report reason."
  if (loreReport === "own_entry") return "You cannot report your own lore entry."
  if (loreReport === "entry_not_found") return "That lore entry could not be found."
  if (loreReport === "error") return "Could not submit lore report."

  if (lore === "updated") return "Lore entry updated."
  if (lore === "invalid_category") return "Choose a valid lore category."
  if (lore === "missing_text") return "Lore entry text is required."
  if (lore === "error") return "Could not update lore entry."

  if (moderatorEdit === "success") return "Canonical tune details updated."
  if (moderatorEdit === "missing_title") return "Title is required."
  if (moderatorEdit === "invalid_key") return "That key is not valid."
  if (moderatorEdit === "invalid_url") return "That reference URL is not valid."
  if (moderatorEdit === "error") return "Could not save canonical details."

  if (referenceUrl === "added") return "Reference recording saved."
  if (referenceUrl === "missing_piece") return "Could not find that tune."
  if (referenceUrl === "invalid_url") return "That reference URL is not valid."
  if (referenceUrl === "not_youtube")
    return "Reference recordings currently need to be YouTube links."
  if (referenceUrl === "already_present")
    return "This tune already has a primary reference recording."
  if (referenceUrl === "error") return "Could not save reference recording."

  if (diary === "note_saved") return "Practice note saved."
  if (diary === "note_deleted") return "Practice note deleted."
  if (diary === "empty_note") return "Write a note before saving."
  if (diary === "practice_check_saved") return "Practice check saved."
  if (diary === "diary_disabled")
    return "Enable Practice Diary before logging tune practice checks."
  if (diary === "invalid_outcome") return "Choose Rough, Shaky, or Solid."
  if (diary === "missing_piece") return "Could not find that tune."

  if (loop === "saved") return "Loop saved."
  if (loop === "deleted") return "Loop deleted."
  if (loop === "missing_fields") return "Add a label before saving the loop."
  if (loop === "invalid_range") return "Set a valid loop start and end first."
  if (loop === "missing_loop") return "Could not find that saved loop."
  if (loop === "missing_piece") return "Could not find that tune."
  if (loop === "error") return "Could not save loop."

  if (pageOptions === "saved") return "Tune page options saved."
  if (pageOptions === "reset") return "Tune page options reset."
  if (pageOptions === "error") return "Could not save tune page options."

  if (listAdd === "success") return "Tune added to list."
  if (listAdd === "partial")
    return "Tune added to new lists. It was already in at least one selected list."
  if (listAdd === "duplicate")
    return "This tune is already in the selected list."
  if (listAdd === "missing_piece") return "Could not find that tune."
  if (listAdd === "missing_list") return "Choose a list before adding the tune."
  if (listAdd === "error") return "Could not add tune to list."

  return null
}