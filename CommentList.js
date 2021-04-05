import React from "react";
import {Grid,Input,Image,Text} from "../elements";
import {useDispatch, useSelector} from "react-redux";
import {actionCreators as commentActions} from "../redux/modules/comment";

const CommentList = (props) => {
    
    const dispatch = useDispatch();
    const comment_list = useSelector(state => state.comment.list);
    const {post_id} = props; //프롭스에서 가져온 post_id 가져오자

    React.useEffect(()=>{
        if(!comment_list[post_id]){
            dispatch(commentActions.getCommentFB(post_id));
        }
    },[])

    if(!comment_list[post_id] || !post_id){
        return null;
    }

    //map돌려라,, c값 넣어주고 key값은 코멘트 id로 준다아
    return (
        <React.Fragment>
            <Grid padding="16px">
                {comment_list[post_id].map(c => {
                    return <CommentItem key={c.id} {...c}/>;
                })}
            </Grid>
        </React.Fragment>
    )
}

CommentList.defaultProps = {
    post_id: null,
}

export default CommentList;

const CommentItem = (props) => {

    const {user_profile, user_name, user_id, post_id, insert_dt,contents} = props;
    return(
        <React.Fragment>
            <Grid is_flex>
                <Grid is_flex width="auto">
                    <Image shape="circle"/>
                    <Text bold>{user_name}</Text>
                </Grid>
                <Grid is_flex margin="0px 4px">
                    <Text margin="0px">{contents}</Text>
                    <Text margin="0px">{insert_dt}</Text>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

CommentItem.defaultProps = {
    user_profile: "",
    user_name: "hyemi",
    user_id: 1,
    post_id: 1,
    contents: "너무 맛있어보인다",
    insert_dt: '2021-01-01 19:00:00'
}

