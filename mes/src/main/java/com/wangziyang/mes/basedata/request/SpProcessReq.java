package com.wangziyang.mes.basedata.request;

public class SpProcessReq {

    private Integer current;
    private Integer size;
    private String processCode;
    private String processName;
    private String workUnitId;
    private String status;

    public Integer getCurrent() {
        return current;
    }

    public void setCurrent(Integer current) {
        this.current = current;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getProcessCode() {
        return processCode;
    }

    public void setProcessCode(String processCode) {
        this.processCode = processCode;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getWorkUnitId() {
        return workUnitId;
    }

    public void setWorkUnitId(String workUnitId) {
        this.workUnitId = workUnitId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
