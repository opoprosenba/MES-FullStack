package com.wangziyang.mes.basedata.request;

import com.wangziyang.mes.common.BasePageReq;

/**
 * 设备编组分页查询请求
 *
 * @author SongPeng
 */
public class SpEquipmentGroupPageReq extends BasePageReq {

    /**
     * 编组代码
     */
    private String code;

    /**
     * 编组名称
     */
    private String name;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
