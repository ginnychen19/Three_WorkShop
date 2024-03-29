"use client";
/*
 * @Author: hongbin
 * @Date: 2023-01-15 14:29:08
 * @LastEditors: hongbin
 * @LastEditTime: 2023-03-28 10:30:23
 * @Description: 新版本使用第三方包需要作为客户端组件渲染
 */
import styled from "styled-components";

export const Container = styled.main`
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background: #000;
`;

export const Title = styled.h1`
    color: #fff;
    font-weight: bold;
    height: 10vh;
    line-height: 10vh;
    text-align: center;
    letter-spacing: 2px;
    text-decoration: underline;
`;

export const Desc = styled.h6`
    color: #ccc;
    font-weight: bold;
    text-align: center;
    letter-spacing: 2px;
`;
