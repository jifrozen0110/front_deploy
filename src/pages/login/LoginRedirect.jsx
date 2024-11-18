import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { setCookie, getCookie } from "../../hooks/cookieUtil"
import { authRequest } from "../../apis/requestBuilder"

const LoginRedirect = () => {
    const navi = useNavigate()
    useEffect(() => {
        const token = new URL(window.location.href).searchParams.get("token")
        if(!token) 
            navi("/")

        localStorage.setItem('jwt', token)

        const goHome = async () => {
            const res = await authRequest().get("/api/user/info")
            if(typeof res.data === 'string'){
                navi("/")
            }else{
                const {email, image, provider, userId, userName} = res.data
                localStorage.setItem("email", email)
                localStorage.setItem("image", image)
                localStorage.setItem("provider", provider)
                localStorage.setItem("userId", userId)
                localStorage.setItem("userName", userName)
                navi("/home")
            }
        }
        goHome()
    },[])
    return <div></div>
}

export default LoginRedirect