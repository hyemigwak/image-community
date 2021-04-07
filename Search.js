import React from "react";
import _ from "lodash";

const Search = () => {
    
    const onChange=(e)=>{
        console.log(e.target.value);
    }
    // 기다렸다가 이것을 하여라 () => {}, 몇 초 있다가?? 시간을(ms)단위로
    const debounce = _.debounce((e)=>{
        console.log(e.target.value);
    },1000);

    const throttle = _.throttle((e)=>{
        console.log(e.target.value);
    }, 1000);

    return(
        <div>
            <input type="text" onChange={onChange}/>
        </div>
    )
}

export default Search;
