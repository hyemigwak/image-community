import React from "react";
import Post from "../components/Post";
import {useSelector, useDispatch} from "react-redux";
import {actionCreators as postActions} from "../redux/modules/post";
import InfinityScroll from "../shared/InfinityScroll";
import {Grid} from "../elements";

const PostList = (props) => {
    const dispatch = useDispatch();
    const post_list = useSelector((state) => state.post.list);
    const user_info = useSelector((state) => state.user.user);
    const is_loading = useSelector((state) => state.post.is_loading);
    const paging = useSelector((state) => state.post.paging);

    const {history} = props;


    React.useEffect(()=>{
        if(post_list.length < 2) { //최대 1개밖에 안들어가니깐
            dispatch(postActions.getPostFB());
        }
        
    },[]);

    return (
        <React.Fragment>
            <InfinityScroll
                callNext={()=>{
                    dispatch(postActions.getPostFB(paging.next));
                }}
                is_next={paging.next? true : false}
                loading={is_loading}
            >
            {post_list.map((p,idx) => {
                //p에서 가지고 있는 user_infor의 user_id가 내가 가져온 user_info의 uid랑 같으면
                // ?. -> 옵셔널 체인지, 로그인 안됬으면(유저인포없오) user_info가 없으므로 그냥 undefine 반환
                if(p.user_info.user_id === user_info?.uid){
                    return(
                        <Grid
                            key={p.id} 
                            _onClick={()=>{
                            history.push(`/post/${p.id}`);
                            }}
                        >
                            <Post key={p.id} {...p} is_me/>
                        </Grid>
                    )
                }else{
                    return(
                        <Grid _onClick={()=>{history.push(`/post/${p.id}`);}}>
                            <Post key={p.id} {...p}/>;
                        </Grid>
                    )
                }
                 //map돌릴때 key를 써줘야함 왜..
                })}
            </InfinityScroll>
        </React.Fragment>
    );
}

export default PostList;