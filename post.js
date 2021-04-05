import {createAction, handleActions} from "redux-actions";
import {produce} from "immer";
import {firestore, storage} from "../../shared/firebase";
import moment, { defaultFormat } from "moment";
import {actionCreators as imageActions} from "./image";


//actions
const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING";

//actions creators
const setPost = createAction(SET_POST, (post_list, paging) => ({post_list, paging}));
const addPost = createAction(ADD_POST, (post) => ({post}));
const editPost = createAction(EDIT_POST, (post_id, post)=>({post_id, post}));
// 수정할때는 post id와, post 내용이 필요하당
const loading = createAction(LOADING, (is_loading) => ({is_loading}));

//initialState (리듀서가 사용할)
const initialState = {
    list: [],
    paging: {start: null, next: null, size: 3}, //무한스크롤 준비 시작점 정보, 다음 가져올 정보, 몇개 가져올건지 
    is_loading: false, // 지금 가져오는 중인지? 
};

// initialState 한개 더 생성(Post.js에서 가져옴), 게시글 하나에서 기본적으로 들어가야할 것들
const initialPost = {
    // id: 0,
    // user_info: {
    //     user_name: "amy",
    //     user_profile: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FO3MxO%2FbtqZ6jT66LG%2Fk7lnetvjV80cdphAV2LSC1%2Fimg.png",
    // },
    image_url:"https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FO3MxO%2FbtqZ6jT66LG%2Fk7lnetvjV80cdphAV2LSC1%2Fimg.png",
    contents: "",
    comment_cnt: 0,
    insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
}

//firebase 연결하기
const editPostFB = (post_id = null, post = {}) => {
    return function (dispatch, getState, {history}){
        
        if(!post_id){
            console.log("게시글 정보가 없어요!");
            return;
        }

        const _image = getState().image.preview;
        const _post_idx = getState().post.list.findIndex(p => p.id === post_id);
        const _post = getState().post.list[_post_idx]
        console.log(_post);

        //같을때는 수정할때 이미지를 새로 업로드해주지 않은것이므로 텍스트만 업로드해줌
        const postDB = firestore.collection("post");
        
        if(_image === _post.image_url){
            // postDB에서 post id를 수정할꼰데, 지금 바뀐 post로 업뎃해쥬라
            postDB.doc(post_id).update(post).then(doc => {
                dispatch(editPost(post_id, {...post})) //뭐 넘겨줄꺼야? post_id랑 post전체
                history.replace("/");
            });
            return;    
        }else {
                const user_id = getState().user.user.uid;
                const _upload = storage
                .ref(`images/${user_id}_${new Date().getTime()}`)
                .putString(_image, "data_url");
    
                _upload.then(snapshot => {
                    snapshot.ref.getDownloadURL().then(url => {
                        console.log(url);
        
                        return url;
                    }).then(url => {
                        postDB
                        .doc(post_id)
                        .update({...post, image_url:url})
                        .then(doc => {
                            dispatch(editPost(post_id, {...post, image_url:url})) //뭐 넘겨줄꺼야? post_id랑 post전체, 임지url
                            history.replace("/");
                        });
                    })
                    .catch((err) => {
                        window.alert("앗 이미지 업로드에 문제가 있어요!");
                        console.log("앗 이미지 업로드에 문제가 있어요!", err);
                    });
                });
            }
    };
};



// 여기서 유저정보는 리덕스에 있기때문에 안가져온다..! (왜지!) 
const addPostFB = (contents="") => {
    return function (dispatch, getState, {history}){
        const postDB = firestore.collection("post");
        const _user = getState().user.user; //user정보.. getState가 store user에 있는 user를 가져올 것
        const user_info = {
            user_name: _user.user_name,
            user_id : _user.uid,
            user_profile: _user.user_profile,
        };
        const _post = {
            ...initialPost,
            contents: contents,
            insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
        };
        
        const _image = getState().image.preview; //getState는 store에있는 정보 접근 가능하게!
        console.log(_image);
        console.log(typeof _image);
        //data url을 가져오기위해 사용자의 uid와 업로드하는 시간을 ms 단위로 가져와야 고유해진다
        const _upload = storage.ref(`images/${user_info.user_id}_${new Date().getTime()}`).putString(_image, "data_url");

        //url 받아왔다. 왜? 파이어스토어에 넣어줄꼬야
        _upload.then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
                console.log(url);

                return url;
            }).then(url => {
                //firestore에 저장하기,  .add({정보넣기} <- 콜렉션에 데이터 추가할 때
                postDB
                .add({...user_info, ..._post, image_url: url})
                .then((doc)=>{
                    let post = {user_info, ..._post, id:doc.id, image_url: url}; //위에만들어놓은거에 id없음
                    dispatch(addPost(post));
                    history.replace("/");
                    //위에까지는 업로드가 잘 끝난 상황. 이제 프리뷰 다시 null로 바꿔줘야 리셋되면 전꺼 안보임
                    dispatch(imageActions.setPreview(null));
                })
                .catch((err) => {
                    window.alert("앗 포스트 작성에 문제가 있어요!");
                    console.log("post 작성에 실패했어요!", err);
                });
            }).catch((err) => {
                window.alert("앗 이미지 업로드에 문제가 있어요!");
                console.log("앗 이미지 업로드에 문제가 있어요!", err);
            })
        });
    }
}


//user정보,contents/댓글정보/이미지url/날짜 등 모든 정보를 firebase에 넣고 가져오고!! 
const getPostFB = (start = null, size = 3) => {
    return function (dispatch, getState, {history}){

        //만약 마지막값이 없다면 dispa~ 아래 부분 실행할 필요가 없어서 return 줌
        let _paging = getState().post.paging;
        if(_paging.start && !_paging.next){
            return;
        }

        dispatch(loading(true));
        const postDB = firestore.collection("post");
        // 위에서 size를 3개로 했지만, 실제로는 4개 가져와서 리덕스에는 3개만 넣는다! 다음페이지가 있다는 뜻
        let query = postDB.orderBy("insert_dt","desc");
        if(start){
            query = query.startAt(start);
        }
        query
        .limit(size + 1)
        .get()
        .then(docs => {
            let post_list = [];

            let paging = {
                start: docs.docs[0],
                next: docs.docs.length == size+1? docs.docs[docs.docs.length-1] : null,
                size: size,
            }

            docs.forEach((doc) => {
                let _post = doc.data(); //파이어스토어에서 가져온 값들
                //배열의 key를 배열로 만들어줌 ['comment_cnt,' 'contetns', ...] -> 내장함수 reduce()로 재연산(누산)
                let post = Object.keys(_post).reduce((acc, cur) => {
                    if(cur.indexOf("user_") !== -1){ //현재값에 user_라는 단어가 포함되어 있다면(-1은 없다는뜻)
                        return {
                            ...acc, 
                            user_info: {...acc.user_info, [cur]: _post[cur] }
                        };
                    }
                    return {...acc, [cur]:_post[cur]}; //키값: _post라는 딕셔너리의 키값이니 밸류!!! 
                }, 
                {id: doc.id, user_info: {}}); //초기값 설정(post_list에 없어서 넣어주쟝)
            
                post_list.push(post);
                

            });
            post_list.pop(); //push에 다 넘어갔으니 마지막꺼 빼준다

            dispatch(setPost(post_list,paging));
        });


        return;
        postDB.get().then((docs) => {
            let post_list = [];
            docs.forEach((doc) => {
                let _post = doc.data(); //파이어스토어에서 가져온 값들
                //배열의 key를 배열로 만들어줌 ['comment_cnt,' 'contetns', ...] -> 내장함수 reduce()로 재연산(누산)
                let post = Object.keys(_post).reduce((acc, cur) => {
                    if(cur.indexOf("user_") !== -1){ //현재값에 user_라는 단어가 포함되어 있다면(-1은 없다는뜻)
                        return {
                            ...acc, 
                            user_info: {...acc.user_info, [cur]: _post[cur] }
                        };
                    }
                    return {...acc, [cur]:_post[cur]}; //키값: _post라는 딕셔너리의 키값이니 밸류!!! 
                }, 
                {id: doc.id, user_info: {}}); //초기값 설정(post_list에 없어서 넣어주쟝)
            post_list.push(post);
                

            });
            console.log(post_list);

            dispatch(setPost(post_list));
        })
    }
}

//firestore에서 post 1개만 가져오기(댓글땜시)
const getOnePostFB = (id) => {
    return function(dispatch, getState,{history}){
        const postDB = firestore.collection("post");
        postDB.doc(id).get().then((doc) => {
            console.log(doc);
            console.log(doc.data());

            let _post = doc.data();
            //데이터를 맞춰주었습니다.. post.js에서 배껴왔습니다...이해못했스니다 
            let post = Object.keys(_post).reduce((acc, cur) => {
                if(cur.indexOf("user_") !== -1){ //현재값에 user_라는 단어가 포함되어 있다면(-1은 없다는뜻)
                    return {
                        ...acc, 
                        user_info: {...acc.user_info, [cur]: _post[cur] },
                    };
                }
                return {...acc, [cur]:_post[cur] }; //키값: _post라는 딕셔너리의 키값이니 밸류!!! 
            },
                { id: doc.id, user_info: {} }
            );
            dispatch(setPost([post])); //[]안에 넣어서 배열, paging은 있을때만 쓰는거라 삭제
        });

    }
}


//reducer 생성 (불변성 유지를 위한 immer 이 단계에서 써주기)
export default handleActions(
    {
        [SET_POST]: (state, action) => produce(state, (draft) => {
            draft.list.push(...action.payload.post_list);
            //draft의 list는 액션으로 넘어온 post_list 추가해줄껴

            //중복값 제거(하나만 가져올때 LIST에 포함되어있을 수 있어서..?)
            draft.list = draft.list.reduce((acc,cur) => {
                if(acc.findIndex(a => a.id === cur.id) === -1){
                    return [...acc, cur]; //중복된 값이 없다면 기존값+현재값
                }else{
                    acc[acc.findIndex((a) => a.id === cur.id)] = cur;
                    return acc;
                    //현재값 넣어줄 필요 없음
                }
            }, []);

            if(action.payload.paging){ //paging이 있을경우에만 부른다...
                draft.paging = action.payload.paging; 
            }
            draft.is_loading = false; //다 불러왔으니깐 false로 바꿔준다
        }),

        [ADD_POST]: (state,action) => produce(state, (draft) => {
            draft.list.unshift(action.payload.post); //push는 맨뒤에 넣는거 unshift 맨 앞에 넣기
        }),
        [EDIT_POST]: (state,action) => produce(state, (draft) => {
           // (p) => 다음 조건에 맞는 애의 인덱스를 리스트에서 찾아서 준다 (findIndex함수)
            let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
            draft.list[idx] = {...draft.list[idx], ...action.payload.post};
        }),
        [LOADING]: (state, action) => produce(state, (draft) => {
            draft.is_loading = action.payload.is_loading;
        })

    }, initialState //마지막에 이니셜스테이트 넘겨주기 꼭
);

// action creator export
const actionCreators = {
    setPost,
    addPost,
    editPost,
    getPostFB,
    addPostFB,
    editPostFB,
    getOnePostFB,
}

export {actionCreators};

