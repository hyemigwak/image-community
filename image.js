import {createAction, handleActions} from "redux-actions";
import {produce} from "immer";

import {storage} from "../../shared/firebase";

//actions 생성
const UPLOADING = "UPLOADING";
const UPLOAD_IMAGE = "UPLOAD_IMAGE";
const SET_PREVIEW = "SET_PREVIEW";

//actions creators 생성
const uploading = createAction(UPLOADING, (uploading) => ({uploading}));
const uploadImage = createAction(UPLOAD_IMAGE,(image_url) => ({image_url})); //마지막에 export 하기
const setPreview = createAction(SET_PREVIEW, (preview) => ({preview}));

//initialState 생성
const initialState = {
    image_url: '',
    uploading: false, //처음엔 업로딩중이 아니니 펄스값
    preview: null,
}

//firebase 업로드 추가해주자

const uploadImageFB = (image) => {
    return function(dispatch, getState, {history}){
        dispatch(uploading(true));
        const _upload = storage.ref(`images/${image.name}`).put(image); //참조만들기, put으로 이미지 올리기
        
        _upload.then((snapshot)=> {
            console.log(snapshot);
            //  dispatch(uploading(flase)); //업로딩 끝나는 순간 false로 바꿔주기 but 아래 dispatch에서 이미 url을 가져왔으니 끝났음. 지워주자
            snapshot.ref.getDownloadURL().then((url)=>{
                dispatch(uploadImage(url));
                console.log(url);
            });
        });
    }
}


//reducer 만들어주자
export default handleActions({
    [UPLOAD_IMAGE]: (state, action) => produce(state, (draft) => {
        draft.image_url = action.payload.image_url;
        draft.uploading = false; //이미지 url 넘겨주면 이제 uploading 끝?
    }),
    [UPLOADING]: (state,action) => produce(state, (draft)=>{
        draft.uploading = action.payload.uploading;
    }),
    [SET_PREVIEW]: (state,action) => produce(state, (draft) => {
        draft.preview = action.payload.preview;
    }),

}, initialState);

// action creators 들을 export 해주자 (uploading은 우리가 컨트롤할 수 없어서 export 불가능)
const actionCreators = {
    uploadImage,
    uploadImageFB,
    setPreview,
}

export {actionCreators};