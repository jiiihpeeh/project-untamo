import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Link,
    Text
  } from '@chakra-ui/react'

  const AppAlert = ()  => {
    return (
        <Alert status='warning'>
        <AlertIcon />
        <Text>You are using development version of Untamo. Download the mobile app <Link href="https://mega.nz/file/ShUXjaSS#KhisDEhnxuLeUxJMn8BZ5ZnWaeA87wIwXoWcId3lcCo" isExternal> <Text as='b'>here</Text>!</Link> </Text>
      </Alert>
    )
  }

  export default AppAlert;
