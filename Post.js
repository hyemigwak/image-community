import React from "react";
// import Grid from "../elements/Grid";
// import Image from "../elements/Image";
// import Text from "../elements/Text";

import {Grid, Image, Text, Button} from "../elements";
import {history} from "../redux/configureStore";

const Post = (props) => {

    return (

        <React.Fragment>
            <Grid>
                <Grid is_flex padding="16px">
                    <Grid is_flex width="auto">
                        <Image shape="circle" src={props.src}/>
                        <Text bold>{props.user_info.user_name}</Text>
                    </Grid> 
                    <Grid is_flex width="auto">
                        <Text>{props.insert_dt}</Text>
                    {/* props에 is_me가 있을때만(내가 쓴 글일때만) 수정버튼을 보여줘 */}
                        {props.is_me && (
                        <Button width="auto" margin="4px" padding="4px" _onClick={()=>{
                            history.push(`/write/${props.id}`);
                        }}>
                        수정</Button>)}
                    </Grid>
                </Grid>    
                  
                <Grid padding="16px">
                    <Text>{props.contents}</Text>
                </Grid>
                <Grid>
                    <Image shape="rectangle" src={props.image_url}/>
                </Grid>
                <Grid padding="16px">
                    <Text margin="0px" bold>댓글 {props.comment_cnt}개</Text>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}


Post.defaultProps = {
    user_info: {
        user_name: "amy",
        user_profile: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FO3MxO%2FbtqZ6jT66LG%2Fk7lnetvjV80cdphAV2LSC1%2Fimg.png",
    },
    image_url:"https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FO3MxO%2FbtqZ6jT66LG%2Fk7lnetvjV80cdphAV2LSC1%2Fimg.png",
    contents: "성수 앤아더",
    comment_cnt: 10,
    insert_dt:"2021-02-27 10:00:00",
    is_me: false,
};

export default Post;