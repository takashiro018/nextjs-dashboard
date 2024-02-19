'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),

    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {

    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
    //throw new Error('Failed to Delete Invoice');

    // Unreachable code block
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice' };
    }
}

const CFormSchema = z.object({
    first_name: z.string(),
    customerFirstName: z.string({
        invalid_type_error: 'Please enter customer firstname.',
    }),
    last_name: z.string(),
    customerLastName: z.string({
        invalid_type_error: 'Please enter customer lastname.',
    }),
    email: z.string(),
    customerEmail: z.string({
        invalid_type_error: 'Please enter customer email.',
    }),
    image_url: z.string(),
    customerImg: z.string({
        invalid_type_error: 'Please enter customer image.',
    }),
});

const CreateCustomer = CFormSchema.omit({ first_name: true, last_name: true, email: true, image_url: true });

export type cState = {
    errors?: {
        customerFirstName?: string[];
        customerLastName?: string[];
        customerEmail?: string[];
        customerImg?: string[];
    };
    message?: string | null;
};

export async function createCustomer(prevState: cState, formData: FormData) {

    // Image
    const file: File | null = formData.get('image_url') as unknown as File
    if (!file) {
        throw new Error('No file uploaded')
    }

    console.log(file);

    //const bytes = await file.arrayBuffer()
    //const buffer = Buffer.from(bytes)

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    //const path = join('/', 'public/customers/', file.name)
    //await writeFile(path, buffer)
    //console.log(`open ${path} to see the uploaded file`)

    // Validate form using Zod
    const validatedFields = CreateCustomer.safeParse({
        customerFirstName: formData.get('first_name'),
        customerLastName: formData.get('last_name'),
        customerEmail: formData.get('email'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Customer.',
        };
    }

    // Prepare data for insertion into the database
    const { customerFirstName, customerLastName, customerEmail, customerImg } = validatedFields.data;

    // Insert data into the database
    try {
        await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (id, ${customerFirstName} ${customerLastName}, ${customerEmail}, ${customerImg})
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch (error) {
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Customer.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

/*const UpdateCustomer = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
    //throw new Error('Failed to Delete Invoice');

    // Unreachable code block
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice' };
    }
}*/