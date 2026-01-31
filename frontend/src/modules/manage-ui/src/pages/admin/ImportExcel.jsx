import React from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

export default function ImportExcel() {
  const props = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        console.log("Excel Data:", json);
        message.success("File processed! Check console for data.");
      };
      reader.readAsArrayBuffer(file);
      return false; // prevent auto upload
    },
  };

  return (
    <div>
      <h2>Import Users from Excel</h2>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Upload Excel</Button>
      </Upload>
    </div>
  );
}
