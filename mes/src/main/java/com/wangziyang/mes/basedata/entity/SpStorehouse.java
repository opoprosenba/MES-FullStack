package com.wangziyang.mes.basedata.entity;

import com.wangziyang.mes.common.BaseEntity;

/**
 * <p>
 * 库房实体
 * </p>
 *
 * @author WangZiYang
 * @since 2020-03-19
 */
public class SpStorehouse extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String storeCode;

    private String storeName;

    private String storeType;

    private String descInfo;

    private Integer groupNum;

    private Integer rowNum;

    private Integer layerNum;

    private Integer colNum;

    private String status;

    private String isDeleted;

    public String getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(String isDeleted) {
        this.isDeleted = isDeleted;
    }

    public void setDeleted(String deleted) {
        this.isDeleted = deleted;
    }

    public String getStoreCode() {
        return storeCode;
    }

    public void setStoreCode(String storeCode) {
        this.storeCode = storeCode;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getStoreType() {
        return storeType;
    }

    public void setStoreType(String storeType) {
        this.storeType = storeType;
    }

    public String getDescInfo() {
        return descInfo;
    }

    public void setDescInfo(String descInfo) {
        this.descInfo = descInfo;
    }

    public Integer getGroupNum() {
        return groupNum;
    }

    public void setGroupNum(Integer groupNum) {
        this.groupNum = groupNum;
    }

    public Integer getRowNum() {
        return rowNum;
    }

    public void setRowNum(Integer rowNum) {
        this.rowNum = rowNum;
    }

    public Integer getLayerNum() {
        return layerNum;
    }

    public void setLayerNum(Integer layerNum) {
        this.layerNum = layerNum;
    }

    public Integer getColNum() {
        return colNum;
    }

    public void setColNum(Integer colNum) {
        this.colNum = colNum;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SpStorehouse{" +
                "storeCode='" + storeCode + '\'' +
                ", storeName='" + storeName + '\'' +
                ", storeType='" + storeType + '\'' +
                ", descInfo='" + descInfo + '\'' +
                ", groupNum=" + groupNum +
                ", rowNum=" + rowNum +
                ", layerNum=" + layerNum +
                ", colNum=" + colNum +
                ", status='" + status + '\'' +
                '}';
    }
}