import React from "react";
import {Grid, Text, Image} from "../elements";
import Card from "../components/Card";
import {realtime} from "../shared/firebase";
import {useSelector} from "react-redux"




const Notification = (props) => {
    //user정보 가져와야함 
    const user = useSelector(state => state.user.user);
    const [noti, setNoti] = React.useState([]);

    //처음 렌더됬을때
    React.useEffect(()=>{
        if(!user){
            return;
        }
        const notiDB = realtime.ref(`noti/${user.uid}/list`); //리스트에서 정보 가져와야해
        const _noti = notiDB.orderByChild("insert_dt"); //리얼타임베이스에서 오름차순 정렬(내림차순 지원안함)
        _noti.once("value", snapshot => {
            if(snapshot.exists()){ //스냅샷 데이터가 있다면?
                let _data = snapshot.val(); //데이터 가져왔당 근데 오름차순이여

                // 키값만 가져와서 reverse(역순정렬) -> 이제 내림차순이당 그리고 map돌려버려
                let _noti_list = Object.keys(_data).reverse().map(s => {
                    return _data[s]; //값만 필요하니까
                })

                console.log(_noti_list);
                setNoti(_noti_list); //빈배열에 차곡차곡 들어가라
            }
        })
        
    },[user]); //[user]을 적어줘야 user정보가 업뎃되면서 다시 들어온다! 

    return (
        <React.Fragment>
            <Grid padding="16px" bg='#EFF6FF'>
                {noti.map((n, idx)=>{
                    return(
                        //map 돌릴땐 key가 있어야한다. 중복값에는 인덱스가 약이여 
                        <Card key={`noti_${idx}`} {...n}/>
                    )
                })}
            </Grid>
        </React.Fragment>
    )
}

export default Notification;