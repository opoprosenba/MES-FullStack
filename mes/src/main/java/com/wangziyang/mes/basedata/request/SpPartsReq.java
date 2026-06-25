package com.wangziyang.mes.basedata.request;

public class SpPartsReq {
    private Long current;
    private Long size;
    private String partCode;
    private String partName;
    private String status;
    private Long categoryId;
    private Integer partsType;

    public Long getCurrent() { return current; }
    public void setCurrent(Long current) { this.current = current; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Integer getPartsType() { return partsType; }
    public void setPartsType(Integer partsType) { this.partsType = partsType; }
}
