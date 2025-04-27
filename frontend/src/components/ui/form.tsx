import * as React from "react";
import { useFormContext, Controller, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  );
});
Form.displayName = "Form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  children: React.ReactNode;
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, children }: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        (React.Children.only(children) as React.ReactElement).props.type === "checkbox" ? (
          React.cloneElement(
            (React.Children.only(children) as React.ReactElement),
            { ...field, value: field.value || false, checked: !!field.value, error: fieldState.error, name }
          )
        ) : (
          React.cloneElement(
            (React.Children.only(children) as React.ReactElement),
            { ...field, error: fieldState.error, name }
          )
        )
      )}
    />
  );
}
FormField.displayName = "FormField";

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    );
  }
);
FormItem.displayName = "FormItem";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium leading-none", className)}
        {...props}
      />
    );
  }
);
FormLabel.displayName = "FormLabel";

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ ...props }, ref) => {
    return <div ref={ref} {...props} />;
  }
);
FormControl.displayName = "FormControl";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
}; 