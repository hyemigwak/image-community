import React from "react";
import _ from "lodash";
import {Spinner} from "../elements";

const InfinityScroll = (props) => {

    const {children, callNext, is_next, loading} = props;
    //처음 로드 됬을때 이벤트 달아줘야함
    const _handleScroll = _.throttle(()=>{
        
        if(loading){ //로딩이 되고 있는중이면 다음꺼 부르지마
            return;
        }

        const {innerHeight} = window;
        const {scrollHeight} = document.body;
        //도큐먼트의 엘리먼트가 있으면 스크롤탑 가져오고 저렇게 못가져오면 도큐먼트 바디에서 스크롤탑 가져와 (브라우저 호환성땜시, 크롬만할거면 뒤에놈만써)
        const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        if(scrollHeight - innerHeight - scrollTop < 200 ){
            callNext();
        }
    },300);

    // 리렌더링 되면 초기화 되기 때문에 throttle 이 제대로 동작되게 해줌 = useCallback(메모이제이션)
    const handleScroll = React.useCallback(_handleScroll, [loading]);
    React.useEffect(() => {
        if(loading){
            return;
        }
        if(is_next){
            window.addEventListener("scroll", handleScroll);
        }else{
            window.removeEventListener("scroll", handleScroll);
        }

        //해제할때=clean up, return으로 처리한다 = unmount
        return () => window.removeEventListener("scroll",handleScroll);
    }, [is_next, loading]);

    return(
        <React.Fragment>
            {props.children}
            {is_next && (<Spinner/>)}
        </React.Fragment>
    )
}

InfinityScroll.defaultProps = {
    children: null,
    callNext: () => {}, //다음꺼 불러오는 함수
    is_next: false, //다음꺼가 있는지 체크
    loading: false, //아직 다음꺼 안불렀는데 부를 수 있으니 로딩중 여부도 체크
}

export default InfinityScroll;