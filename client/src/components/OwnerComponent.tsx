import { useAuthState } from "../context/auth"

export default function OwnerComponent({ children, username }) {
    const { authenticated, loading, user} = useAuthState()
    
    return (!loading && (authenticated && username === user?.username ? (
    <>
    {children}
    </>
  ) : null) )
}
