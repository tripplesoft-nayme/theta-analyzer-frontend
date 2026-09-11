import React, { cloneElement, ReactElement, isValidElement } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { setIsPreview, setIsPublished } from "@/store/Slices/ChartSlice/ChartSlice";
import type { BreadcrumbItemData } from "./types";

interface HeaderBreadcrumbProps {
  breadcrumbData: BreadcrumbItemData[];
  isPreview: boolean;
  isPublished: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any;
  currentPath: string;
}

/**
 * HeaderBreadcrumb
 *
 * Renders the scrollable breadcrumb trail below the main header row.
 * Clicking a breadcrumb link that matches the current path resets
 * the preview / published state in the Redux store.
 */
const HeaderBreadcrumb: React.FC<HeaderBreadcrumbProps> = ({
  breadcrumbData,
  isPreview,
  isPublished,
  dispatch,
}) => {
  return (
    <div className="overflow-x-auto no-scrollbar py-1">
      <Breadcrumb className="my-2 min-w-max">
        <BreadcrumbList>
          {breadcrumbData.map((item, index: number) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isPage ? (
                  <BreadcrumbPage className="text-[#356DF0]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.path || "#"}
                      onClick={() => {
                        // Reset preview / published state on any breadcrumb click
                        if (isPreview || isPublished) {
                          dispatch(setIsPreview(false));
                          dispatch(setIsPublished(false));
                        }
                      }}
                      className={
                        index > 0
                          ? "text-[#356DF0] font-semibold flex items-center gap-1"
                          : ""
                      }
                    >
                      {item.icon &&
                        isValidElement(item.icon) &&
                        cloneElement(
                          item.icon as ReactElement<{ className?: string }>,
                          { className: "w-4 h-4" },
                        )}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbData.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default HeaderBreadcrumb;
