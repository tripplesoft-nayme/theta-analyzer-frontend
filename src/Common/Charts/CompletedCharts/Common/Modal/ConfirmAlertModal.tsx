import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ConfirmAlertModal(
    {id, handleConfirm, button}:
    {id:string; handleConfirm:(id:string)=> void; button: React.ReactNode}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {button}
      </AlertDialogTrigger>
      <AlertDialogContent className="z-999 bg-white dark:bg-slate-900 border dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-slate-100">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-slate-400">
            This action cannot be undone. This will permanently remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleConfirm(id)} className="bg-black dark:bg-slate-100 dark:text-slate-900 text-white">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
