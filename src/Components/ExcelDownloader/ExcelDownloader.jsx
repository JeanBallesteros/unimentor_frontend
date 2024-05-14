import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs/dist/exceljs.min.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { MdDownloadForOffline } from "react-icons/md";
import "./ExcelDownloader.css";

function ExcelDownloader({ data, fileName, usuario, registro, month, price }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const role = jwtDecode(accessToken).user.role;
      if (!accessToken || role != "master") {
        navigate("/");
      }
    };

    checkAuthentication();
  }, []);

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte Horas");
    const userId = usuario._id;
    const response = await axios.get(
      `https://unimentor-fqz8.onrender.com/api/v1/hourlog/monitormonthsemester/${userId}?month=${month}`
    );

    const globalStyle = {
      font: { name: "Arial", size: 12 },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const boldStyle = {
      font: { name: "Arial", size: 12, bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const currencyStyle = {
      font: { name: "Arial", size: 12, bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
      numFmt: "$#,##0.00",
    };

    if (!month) {
      Swal.fire({
        title: "Selecciona un mes",
        text: "Debes seleccionar un mes antes de descargar el reporte.",
        icon: "info",
        confirmButtonText: "Aceptar",
      });
    }

    worksheet.addRow(["Nombre", usuario.fullname]).eachCell((cell) => {
      cell.style = boldStyle;
    });
    worksheet.addRow(["C.C", usuario.documentNumber]).eachCell((cell) => {
      cell.style = boldStyle;
    });
    worksheet.addRow(["Email UAM", usuario.email]).eachCell((cell) => {
      cell.style = boldStyle;
    });
    worksheet.addRow([]);
    worksheet
      .addRow([
        "Asignatura",
        "Fecha de la Clase",
        "Docente a Cargo",
        "Programa y Grupo",
        "Cantidad de Horas",
      ])
      .eachCell((cell) => {
        cell.style = boldStyle;
      });
    response.data.hoursLog.forEach(
      ({ subject, date, teacher, program, group, hours }) => {
        worksheet
          .addRow([
            subject[0].name,
            date.slice(0, 10),
            teacher[0].fullname,
            group[0].name,
            hours,
          ])
          .eachCell((cell) => {
            cell.style = globalStyle;
          });
      }
    );
    worksheet.addRow([]);
    worksheet
      .addRow(["Total Horas", response.data.sum[0].totalHours])
      .eachCell((cell) => {
        cell.style = boldStyle;
      });
    worksheet.addRow([]);
    const row = worksheet.addRow([
      "Total a Pagar",
      price * response.data.sum[0].totalHours,
    ]);
    row.getCell(1).style = boldStyle;
    row.getCell(2).style = currencyStyle;

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(
          maxLength,
          cell.value ? cell.value.toString().length : 0
        );
      });
      column.width = maxLength < 10 ? 10 : maxLength + 10;
    });

    // Combinar celdas de Nombre, C.C y Email

    worksheet.mergeCells("B1:E1");
    worksheet.mergeCells("B2:E2");
    worksheet.mergeCells("B3:E3");

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <button 
      className="btn-excel-download"
      onClick={handleDownload}>
      <MdDownloadForOffline className="icon"/>
    </button>
  );
}

export default ExcelDownloader;
