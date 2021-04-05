import React from "react";
import {Badge} from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';
import {realtime} from "../shared/firebase";
import {useSelector} from "react-redux";

const NotiBadge = (props) => {
    const [is_read, setIsRead] = React.useState(true); //읽었는지 확인하는 기능
    const user_id = useSelector(state => state.user.user.uid);
    const notiCheck = () => {
        const notiDB = realtime.ref(`noti/${user_id}`);
        notiDB.update({read: true}); //noticheck를 하면 꺼준다!(알림을 누르고 들어가면)
        props._onClick();
    };

    //noti를 구독하려면 한번 마운트될때 구독, 사라질때 없앤다! 
    React.useEffect(()=>{
        const notiDB = realtime.ref(`noti/${user_id}`);
        notiDB.on("value", (snapshot) => {
            console.log(snapshot.val());
            setIsRead(snapshot.val().read);
        }); //구독 on/off 설정, ()=>{} 여기에 값이 바뀔대 뭐를 동작했음 좋겠어가 들어가
        //useEffect의 구독 해제는 return에서 하자

        return () => notiDB.off();
    },[]);


    return (
        <React.Fragment>
            <Badge color="secondary" variant="dot" invisible={is_read} onClick={notiCheck}>
                <NotificationsIcon/>
            </Badge>
        </React.Fragment>
    )
}

NotiBadge.defaultProps = {
    _onClick: () => {},
};


export default NotiBadge;
