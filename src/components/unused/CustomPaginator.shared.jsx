import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";


function CustomPaginator({
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    hasMoreData,
}) {
    const rowsPerPageOptions = [10, 20, 30, 40, 50];

    const maxPageNumbersToShow = 5;

    const pageNumbers = Array.from(
        { length: maxPageNumbersToShow },
        (_, i) => page + i
    );

    return (
        <div className="p-paginator p-component p-unselectable-text">
            <Button
                icon="pi pi-chevron-left"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="p-paginator-prev p-paginator-element"
            />
            {pageNumbers.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`transition-colors duration-150 ease-in-out px-3 py-1 border-gray-300 mr-2 rounded-full h-12 w-12  ${
                        pageNumber === page
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-200 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50"
                            : "bg-white text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    }`}
                >
                    {pageNumber + 1}
                </button>
            ))}

            <Button
                icon="pi pi-chevron-right"
                onClick={() =>
                    setPage((prev) => (hasMoreData ? prev + 1 : prev))
                }
                disabled={!hasMoreData}
                className="p-paginator-next p-paginator-element"
            />
            <Dropdown
                value={rowsPerPage}
                options={rowsPerPageOptions}
                onChange={(e) => setRowsPerPage(e.value)}
                appendTo={document.body}
                className="p-paginator-rpp-options"
            />
        </div>
    );
}

export default CustomPaginator;