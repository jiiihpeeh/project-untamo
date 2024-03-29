import { AlertDialog,AlertDialogOverlay,
         AlertDialogContent,AlertDialogHeader,
         AlertDialogBody,AlertDialogFooter,
         Button,Text } from "@chakra-ui/react" 
import React, { useRef, useEffect,useState } from "react"
import { useDevices, usePopups } from "../../stores"

function DeviceDelete() {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleteDevice = useDevices((state) => state.deleteDevice)
  const showDelete = usePopups((state) => state.showDeleteDevice)
  const setShowDelete = usePopups((state) => state.setShowDeleteDevice)
  const toDelete = useDevices((state) => state.toDelete)
  const setToDelete = useDevices((state) => state.setToDelete)
  const [deleteID, setDeleteId] = useState<null | string>(null)

  function cancel(): void {
    setShowDelete(false)
    setToDelete(null)
  }
  useEffect(() => {
    if (toDelete) {
      setDeleteId(toDelete.id)
    }
  }, [toDelete])
  return (
    <AlertDialog
      isOpen={showDelete}
      leastDestructiveRef={cancelRef}
      onClose={() => setShowDelete(false)}
      id="DeviceDeletePopUp"
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize='lg'
            fontWeight='bold'
          >
            Delete device <Text
              as='b'
            >
              {toDelete ? toDelete.deviceName : ''}
            </Text>?
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={() => {
                deleteDevice(deleteID ? deleteID : '')
                setShowDelete(false)
              } }
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
export default DeviceDelete  