package com.wangziyang.mes.basedata.request;

public class SpProductBomReq {
    private Long current;
    private Long size;
    private String productMaterialCode;
    private String productMaterialName;
    private Integer version;
    private Integer isLocked;
    private String validity;

    public Long getCurrent() {
        return current;
    }

    public void setCurrent(Long current) {
        this.current = current;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getProductMaterialCode() {
        return productMaterialCode;
    }

    public void setProductMaterialCode(String productMaterialCode) {
        this.productMaterialCode = productMaterialCode;
    }

    public String getProductMaterialName() {
        return productMaterialName;
    }

    public void setProductMaterialName(String productMaterialName) {
        this.productMaterialName = productMaterialName;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Integer getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Integer isLocked) {
        this.isLocked = isLocked;
    }

    public String getValidity() {
        return validity;
    }

    public void setValidity(String validity) {
        this.validity = validity;
    }
}
