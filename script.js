// ==UserScript==
// @name         b站番剧下载bat生成器
// @namespace    http://tampermonkey.net/
// @version      2025-05-14
// @description  try to take over the world!
// @author       GKK
// @match        https://www.bilibili.com/bangumi/play/*
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';
    let extractedLinks = [];
    // 创建悬浮按钮
    const floatBtn = document.createElement('div');
    floatBtn.innerHTML = '提取';
    floatBtn.style.position = 'fixed';
    floatBtn.style.right = '20px';
    floatBtn.style.top = '40px';
    floatBtn.style.backgroundColor = '#4CAF50';
    floatBtn.style.color = 'white';
    floatBtn.style.padding = '10px 15px';
    floatBtn.style.borderRadius = '5px';
    floatBtn.style.cursor = 'pointer';
    floatBtn.style.zIndex = '9999';
    floatBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    floatBtn.addEventListener('click', showPopup);

    document.body.appendChild(floatBtn);

    // 创建弹出窗口
    function showPopup() {
        // 如果已经存在弹出窗口，则不再创建
        if (document.getElementById('data-extractor-popup')) {
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'data-extractor-popup';
        popup.style.position = 'fixed';
        popup.style.right = '20px';
        popup.style.top = '70px';
        popup.style.width = '300px';
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid #ddd';
        popup.style.borderRadius = '5px';
        popup.style.padding = '15px';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9998';

        // 输入框
        const inputLabel = document.createElement('label');
        inputLabel.textContent = '正片的标签(f12审查元素):';
        inputLabel.style.display = 'block';
        inputLabel.style.marginBottom = '5px';
        popup.appendChild(inputLabel);

        const input = document.createElement('input');
        input.type = 'text';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginBottom = '10px';
        input.style.boxSizing = 'border-box';
        input.placeholder = '例如: .link-class or a[href]';
        input.value = 'numberListItem_number_list_item__T2VKO';
        popup.appendChild(input);

        // 开始按钮
        const startBtn = document.createElement('button');
        startBtn.textContent = '开始提取';
        startBtn.style.backgroundColor = '#4CAF50';
        startBtn.style.color = 'white';
        startBtn.style.border = 'none';
        startBtn.style.padding = '8px 15px';
        startBtn.style.borderRadius = '4px';
        startBtn.style.cursor = 'pointer';
        startBtn.style.marginBottom = '10px';
        startBtn.addEventListener('click', () => extractData(input.value));
        popup.appendChild(startBtn);

        const exportBtn = document.createElement('button');
        exportBtn.textContent = '下载BAT';
        exportBtn.style.backgroundColor = '#FF9500';
        exportBtn.style.color = 'white';
        exportBtn.style.border = 'none';
        exportBtn.style.padding = '8px 15px';
        exportBtn.style.borderRadius = '4px';
        exportBtn.style.cursor = 'pointer';
        exportBtn.style.flex = '1';
        exportBtn.style.marginLeft = '5px';
        exportBtn.addEventListener('click', exportAsBat);
        popup.appendChild(exportBtn);

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.backgroundColor = '#f44336';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.padding = '8px 15px';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.float = 'right';
        closeBtn.addEventListener('click', () => document.body.removeChild(popup));
        popup.appendChild(closeBtn);

        // 结果展示区
        const resultArea = document.createElement('div');
        resultArea.id = 'data-extractor-result';
        resultArea.style.maxHeight = '200px';
        resultArea.style.overflowY = 'auto';
        resultArea.style.border = '1px solid #eee';
        resultArea.style.padding = '10px';
        resultArea.style.marginTop = '10px';
        resultArea.style.whiteSpace = 'pre-wrap';
        resultArea.style.fontFamily = 'monospace';
        resultArea.textContent = '提取结果将显示在这里...';
        popup.appendChild(resultArea);

        document.body.appendChild(popup);

    }
    // 添加导出函数
    function exportAsBat() {
      if (extractedLinks.length === 0) {
            GM_notification({
                title: '导出失败',
                text: '没有可导出的链接',
                timeout: 2000
            });
            return;
        }
        let batContent = `@echo off\nchcp 65001 >nul\nsetlocal enabledelayedexpansion\n\n`;
        // 添加数组
        extractedLinks.forEach((bv, index) => {
            batContent += `set bv[${index}]=${bv.href}\n`;
        });
        // 添加下载命令
        batContent += `for /l \%\%i in (0,1,${extractedLinks.length - 1}) do (\n`;
        batContent += `    BBDown.exe !bv[\%\%i]!\n`;
        batContent += `    timeout /t 5 /nobreak >nul\n`;
        batContent += `    echo.\n`;
        batContent += `)\n`;
        batContent += `pause\n`;

        // 生成文件名
        const blob = new Blob([batContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        console.log(batContent);
        const a = document.createElement('a');
        a.href = url;
        a.download = "bilibili.bat";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    // 提取数据
    function extractData(selector) {
        if (!selector) {
            updateResult('请输入有效的CSS选择器');
            return;
        }

        try {
            const elements = document.querySelectorAll("."+selector);
            if (elements.length === 0) {
                updateResult('没有找到匹配的元素');
                return;
            }

            let result = '';
            elements.forEach((el, index) => {
                const link = el.querySelector('a');
                const href = link.href ;
                const text = link.textContent.trim();
                extractedLinks.push(link);
                // 格式化输出
                result += `[${index + 1}] ${text}:\n`;
                result += `${href}\n`;
            });

            updateResult(`找到 ${elements.length} 个匹配元素:\n\n${result}`);
        } catch (e) {
            updateResult(`错误: ${e.message}`);
        }
    }

    // 更新结果区域
    function updateResult(text) {
        const resultArea = document.getElementById('data-extractor-result');
        if (resultArea) {
            resultArea.textContent = text;
        }
    }

    // 复制到剪贴板
    function copyToClipboard() {
            let batContent = `name,href`;
            extractedLinks.forEach((bv, index) => {
                batContent += `${bv.textContent},${bv.href}\n`;
            });
            console.log(batContent);
            GM_setClipboard(batContent);
            GM_notification({
                title: '复制成功',
                text: '结果已复制到剪贴板',
                timeout: 2000
            });
    }
})();
