function toDou(n){
    return n<10?'0'+n:n;
}
module.exports = {
    time2Date : function(timestamp){
        var oDate = new Date();
        oDate.setTime(timestamp);
        return oDate.getFullYear() + "-" + toDou(oDate.getMonth() + 1) + "-" + toDou(oDate.getDate()) + " " + oDate.getHours() + ":" + toDou(oDate.getMinutes()) + ":" + toDou(oDate.getSeconds());
    }
}