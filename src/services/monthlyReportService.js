import axios from "axios";

const API =
"http://localhost:5000/api/monthly-report";

export const getMonthlyReport =
async (fromDate,toDate)=>{

const res =
await axios.get(API,{

params:{

fromDate,

toDate

}

});

return res.data;

};

export const closeMonth =
async(data)=>{

const res =
await axios.post(

`${API}/close`,

data

);

return res.data;

};