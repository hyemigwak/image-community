import React from "react";
import {Grid,Input,Button} from "../elements";
import {actionCreators as commentActions} from "../redux/modules/comment";
import {useDispatch, useSelector} from "react-redux";


const CommentWrite = (props) => {
    const dispatch = useDispatch();
    const [comment_text, setCommentText] = React.useState();

    const {post_id} = props; //가져올 것

    const onChange = (e) => {
        setCommentText(e.target.value)
    }

    const write = () => {
        dispatch(commentActions.addCommentFB(post_id, comment_text)); //넘겨줄 것
        setCommentText(""); // value 물리고, 이렇게 하면 작성 누르면 인풋에 작성한 글이 리셋된다
    
    }

    
    return (
        <React.Fragment>
            <Grid padding="16px" is_flex>
                <Input placeholder="댓글 내용을 입력해주세요 :)" 
                _onChange={onChange} 
                value={comment_text}
                is_Submit //다 썼으면 날아가라 -> input참고해
                onSubmit={write} //엔터키치면 입력 가능하게(onKeyPress 이벤트)

                />
                <Button width="50px" margin="0px 2px 0px 2px"
                _onClick={write}
                >작성</Button>
            </Grid>
        </React.Fragment>
    )
}

export default CommentWrite;