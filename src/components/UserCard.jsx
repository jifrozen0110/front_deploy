export default function UserCard({ userImage="", userName="", imageSize=40, nameSize=20, color="white" }) {

    return (
        <div style = {{display: "flex", gap: "10px", alignItems: "center"}}>
            <img
                src = {userImage}
                art = "유저 이미지"
                style = {{width: `${imageSize}px`, height: `${imageSize}px`, borderRadius: `${imageSize}px`, aspectRatio: "1 / 1"}}
            ></img>
            <div style = {{fontSize: `${nameSize}px`, color: `${color}`}}>
                {userName}
            </div>
        </div>
    );
}
