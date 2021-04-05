import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realtime } from "../../shared/firebase";
import "moment";
import moment from "moment";
import firebase from "firebase/app";
import {actionCreators as postActions} from "./post";
import {actionCreators as userActions} from "./user";


const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";

const LOADING = "LOADING";

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({post_id, comment_list}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({post_id, comment}));

const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: {},
  is_loading: false,
};

const addCommentFB = (post_id, contents) => {
  return function(dispatch, getState,{history}){
    const commentDB = firestore.collection("comment");
    const user_info = getState().user.user;
    const post = getState().post.list.find(l => l.id === post_id); 
    // 리덕스 post 리스트 한개의 id가 내가 갖고있는 post id랑 같은지 그러면 post에 넣어쥼

    let comment = {
      post_id: post_id,
      user_id:user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    }
    //firestore 저장하기
    commentDB
    .add(comment)
    .then((doc) => {
      const postDB = firestore.collection("post");
      //increment는 (1)갯수만큼 현재 갯수에 더해줌, 좋아요갯수는 리덕스에서 가져오지않는다!!
      const increment = firebase.firestore.FieldValue.increment(1);
      // let a = 5; a = a+1 comment_cnt + 1 

      comment = {...comment, id:doc.id};
      postDB
      .doc(post_id)
      .update({comment_cnt: increment})
      .then((_post) => {

        dispatch(addComment(post_id, comment));

        if(post){
          dispatch(
            postActions.editPost(post_id, {
              comment_cnt: parseInt(post.comment_cnt) + 1})); //리덕스만 고쳐준다 FB 아님(이미 고침)
        
          //코멘트 달리고, post가 있어야 user_id가 있다.. 이 밑에 써쥬자
          const _noti_item = realtime.ref(`noti/${post.user_info.user_id}/list`).push();
          //그 아래 리스트를 만들고, push key값을 받아올 수 있다..but 여기선 필요없댜..ㅜ?
          _noti_item.set({ //set ? 넣어준다! 
            post_id: post.id,
            user_name: comment.user_name,
            image_url: post.image_url,
            insert_dt: comment.insert_dt,
          },(err) => {
            if(err){
              console.log("알림 저장에 실패했어요!");
            }else{
              const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);
              notiDB.update({read: false});
            }
          })
          
          
          
          // notiDB.update({read: false}); //안읽었네 라는 뜻으로 업뎃해쥬자


        }


      })
    })

  }
    

}

//복합쿼리 사용
const getCommentFB = (post_id = null) => {
    return function(dispatch, getState, {history}){
      if(!post_id){
        return;
      }

      const commentDB = firestore.collection("comment");
      commentDB
      .where("post_id", "==", post_id) //post_id값이 post id 인 값만...해당 게시물의 것만.. (?ㅠ) 
      .orderBy("insert_dt","desc") //날짜 역순
      .get()
      .then((docs) => {
        let list = [];
        docs.forEach((doc)=>{ //doc을 반복문으로 돌려서 하나하나 리스트에 넣어쥰다 doc의 데이터들이랑, 코멘트 콜렉션의 id를 넣어쥼 
          list.push({...doc.data(), id: doc.id});
        })

        dispatch(setComment(post_id,list));
      }).catch(err => {
        console.log('댓글 정보를 가져올 수가 없네요!', err);
      });
    };
};


export default handleActions(
  {
      [SET_COMMENT]: (state, action) => produce(state, (draft) => {
        // let data = {[post_id]: com_list,...} 데이터 안에 포스트 아이디는 코멘트 리스트 등을 미리 저장하고, 불러서 쓴다 
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),
      [ADD_COMMENT]: (state, action) => produce(state, (draft)=> {
        draft.list[action.payload.post_id].unshift(action.payload.comment);
        // 방금 만든 comment가 unshift(배열에 맨.앞.으로 추가)된다.
      }),
      [LOADING]: (state, action) => 
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      })
  },
  initialState
);

const actionCreators = {
  getCommentFB,
  setComment,
  addComment,
  addCommentFB,
  
};

export { actionCreators };